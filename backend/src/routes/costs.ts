import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { decrypt } from '../utils/encryption';
import { detectCostAnomalies, forecastCosts } from '../costAnomalyDetector';

const router = express.Router();
const prisma = new PrismaClient();

/** Helper — fetch and decrypt this user's AWS credentials from the DB. */
async function getUserCredentials(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.awsAccessKeyId || !user?.awsSecretAccessKey || !user?.awsRegion) {
        throw new Error('AWS credentials not connected');
    }
    return {
        accessKeyId: decrypt(user.awsAccessKeyId),
        secretAccessKey: decrypt(user.awsSecretAccessKey),
        region: user.awsRegion,
    };
}

router.get('/anomalies', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const credentials = await getUserCredentials(userId);
        const result = await detectCostAnomalies(userId, credentials);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/forecast', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const days = parseInt(req.query.days as string) || 30;
        const credentials = await getUserCredentials(userId);
        const result = await forecastCosts(userId, credentials, days);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
