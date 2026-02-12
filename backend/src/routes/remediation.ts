import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { decrypt } from '../utils/encryption';
import {
    stopInstance,
    terminateInstance,
    deleteVolume,
    releaseElasticIP,
    bulkTerminateInstances,
    bulkDeleteVolumes
} from '../remediationService';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to get user credentials
const getCredentials = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user || !user.awsAccessKeyId || !user.awsSecretAccessKey || !user.awsRegion) {
        throw new Error('AWS credentials not found');
    }

    return {
        accessKeyId: decrypt(user.awsAccessKeyId),
        secretAccessKey: decrypt(user.awsSecretAccessKey),
        region: user.awsRegion,
    };
};

// Terminate or stop an instance
router.post('/instance', async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId, action } = req.body;
        const userId = (req as any).user.userId;

        if (!['stop', 'terminate'].includes(action)) {
            res.status(400).json({ error: 'Invalid action' });
            return;
        }

        const credentials = await getCredentials(userId);
        let result;

        if (action === 'stop') {
            result = await stopInstance(credentials, instanceId);
        } else {
            result = await terminateInstance(credentials, instanceId);
        }

        // Log the action
        await prisma.remediationAction.create({
            data: {
                userId,
                resourceId: instanceId,
                resourceType: 'instance',
                action,
                status: result.status,
                error: result.error,
            },
        });

        if (result.status === 'success') {
            // Remove from IdleInstance if it exists
            await prisma.idleInstance.deleteMany({
                where: { instanceId, userId }
            });
            res.json({ message: `Instance ${action} initiated successfully`, result });
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error: any) {
        console.error('Remediation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete a volume
router.post('/volume', async (req: Request, res: Response): Promise<void> => {
    try {
        const { volumeId, createSnapshot = true } = req.body;
        const userId = (req as any).user.userId;

        const credentials = await getCredentials(userId);
        const result = await deleteVolume(credentials, volumeId, createSnapshot);

        // Log the action
        await prisma.remediationAction.create({
            data: {
                userId,
                resourceId: volumeId,
                resourceType: 'volume',
                action: 'delete',
                status: result.status,
                error: result.error,
            },
        });

        if (result.status === 'success') {
            // Remove from OrphanedVolume
            await prisma.orphanedVolume.deleteMany({
                where: { volumeId, userId }
            });
            res.json({ message: 'Volume deletion initiated', result });
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error: any) {
        console.error('Remediation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Release an Elastic IP
router.post('/eip', async (req: Request, res: Response): Promise<void> => {
    try {
        const { allocationId } = req.body;
        const userId = (req as any).user.userId;

        const credentials = await getCredentials(userId);
        const result = await releaseElasticIP(credentials, allocationId);

        // Log the action
        await prisma.remediationAction.create({
            data: {
                userId,
                resourceId: allocationId,
                resourceType: 'eip',
                action: 'release',
                status: result.status,
                error: result.error,
            },
        });

        if (result.status === 'success') {
            // Remove from UnattachedEIP
            await prisma.unattachedEIP.deleteMany({
                where: { allocationId, userId }
            });
            res.json({ message: 'Elastic IP released', result });
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error: any) {
        console.error('Remediation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Bulk actions
router.post('/bulk', async (req: Request, res: Response): Promise<void> => {
    try {
        const { items } = req.body; // Array of { id, type, action }
        const userId = (req as any).user.userId;

        if (!Array.isArray(items)) {
            res.status(400).json({ error: 'Items must be an array' });
            return;
        }

        const credentials = await getCredentials(userId);
        const results = [];

        // Group by type for efficiency
        const instancesToTerminate = items
            .filter(i => i.type === 'instance' && i.action === 'terminate')
            .map(i => i.id);

        const volumesToDelete = items
            .filter(i => i.type === 'volume' && i.action === 'delete')
            .map(i => i.id);

        // Execute bulk operations
        if (instancesToTerminate.length > 0) {
            const terminateResults = await bulkTerminateInstances(credentials, instancesToTerminate);
            results.push(...terminateResults);

            // Update DB
            for (const res of terminateResults) {
                await prisma.remediationAction.create({
                    data: {
                        userId,
                        resourceId: res.resourceId,
                        resourceType: 'instance',
                        action: 'terminate',
                        status: res.status,
                        error: res.error,
                    },
                });
                if (res.status === 'success') {
                    await prisma.idleInstance.deleteMany({ where: { instanceId: res.resourceId, userId } });
                }
            }
        }

        if (volumesToDelete.length > 0) {
            const deleteResults = await bulkDeleteVolumes(credentials, volumesToDelete);
            results.push(...deleteResults);

            // Update DB
            for (const res of deleteResults) {
                await prisma.remediationAction.create({
                    data: {
                        userId,
                        resourceId: res.resourceId,
                        resourceType: 'volume',
                        action: 'delete',
                        status: res.status,
                        error: res.error,
                    },
                });
                if (res.status === 'success') {
                    await prisma.orphanedVolume.deleteMany({ where: { volumeId: res.resourceId, userId } });
                }
            }
        }

        res.json({ message: 'Bulk actions processed', results });

    } catch (error: any) {
        console.error('Bulk remediation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get remediation history
router.get('/history', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const history = await prisma.remediationAction.findMany({
            where: { userId },
            orderBy: { executedAt: 'desc' },
            take: 50,
        });
        res.json(history);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
