import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { decrypt } from '../utils/encryption';
import { analyzeEC2RightSizing, analyzeEBSOptimization } from '../rightSizingAnalyzer';

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

// Get right-sizing recommendations
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const refresh = req.query.refresh === 'true';

        // If not refresh, try to get from DB first
        if (!refresh) {
            const cached = await prisma.rightSizingRecommendation.findMany({
                where: { userId, applied: false },
                orderBy: { monthlySavings: 'desc' },
            });

            if (cached.length > 0) {
                return res.json(cached);
            }
        }

        // Otherwise, analyze fresh
        const credentials = await getCredentials(userId);

        // Run analyses in parallel
        const [ec2Recommendations, ebsRecommendations] = await Promise.all([
            analyzeEC2RightSizing(credentials),
            analyzeEBSOptimization(credentials),
        ]);

        const allRecommendations = [...ec2Recommendations, ...ebsRecommendations];

        // Update DB: clear old recommendations and insert new ones
        // In a real app we might want to be smarter about merging
        await prisma.rightSizingRecommendation.deleteMany({
            where: { userId, applied: false }
        });

        // Bulk insert
        if (allRecommendations.length > 0) {
            // Prisma createMany is not supported for SQLite but is for Postgres
            // Assuming Postgres based on schema datasource
            await prisma.rightSizingRecommendation.createMany({
                data: allRecommendations.map(rec => ({
                    userId,
                    resourceId: rec.resourceId,
                    resourceType: rec.resourceType,
                    currentType: rec.currentType,
                    recommendedType: rec.recommendedType,
                    currentCost: rec.currentCost,
                    recommendedCost: rec.recommendedCost,
                    monthlySavings: rec.monthlySavings,
                    reason: rec.reason,
                    confidence: rec.confidence,
                })),
            });
        }

        const savedRecommendations = await prisma.rightSizingRecommendation.findMany({
            where: { userId, applied: false },
            orderBy: { monthlySavings: 'desc' },
        });

        res.json(savedRecommendations);

    } catch (error: any) {
        console.error('Recommendation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mark recommendation as applied (or ignored)
router.post('/apply/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.userId;

        const updated = await prisma.rightSizingRecommendation.update({
            where: { id },
            data: { applied: true },
        });

        // Logic to actually apply the recommendation (e.g. modify instance type)
        // would go here. For now, we just mark it as applied in DB.

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
