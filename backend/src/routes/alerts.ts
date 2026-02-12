import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { checkAlerts, sendTestAlert } from '../alertingService';

const router = express.Router();
const prisma = new PrismaClient();

// Get all alerts
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const alerts = await prisma.alert.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        res.json(alerts);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Mark alert as read
router.post('/:id/read', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.userId;

        await prisma.alert.updateMany({
            where: { id, userId },
            data: { isRead: true },
        });

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Mark all as read
router.post('/read-all', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;

        await prisma.alert.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get alert configurations
router.get('/config', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const configs = await prisma.alertConfiguration.findMany({
            where: { userId },
        });
        res.json(configs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update alert configuration
router.post('/config', async (req: Request, res: Response) => {
    try {
        const { type, threshold, enabled, channels } = req.body;
        const userId = (req as any).user.userId;

        const config = await prisma.alertConfiguration.upsert({
            where: {
                userId_type: { userId, type },
            },
            update: { threshold, enabled, channels },
            create: { userId, type, threshold, enabled, channels },
        });

        res.json(config);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Trigger manual check
router.post('/check', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        await checkAlerts(userId);
        res.json({ message: 'Alert check triggered' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
