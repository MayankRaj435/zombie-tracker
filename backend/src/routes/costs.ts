import express, { Request, Response } from 'express';
import { detectCostAnomalies, forecastCosts } from '../costAnomalyDetector';

const router = express.Router();

router.get('/anomalies', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const anomalies = await detectCostAnomalies(userId);
        res.json(anomalies);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/forecast', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const days = parseInt(req.query.days as string) || 30;
        const forecast = await forecastCosts(userId, days);
        res.json(forecast);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
