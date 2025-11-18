import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cron from 'node-cron'; // Import the cron library
import cors from 'cors'; 
import { findIdleEC2Instances, findOrphanedEBSVolumes, findUnattachedEIPs } from './awsScanner';
import { prisma } from './prisma';
import authRoutes from './routes/authRoutes';
import { authMiddleware, AuthRequest } from './middleware/authMiddleware';
import { decrypt } from './utils/encryption';

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

// Auth routes
app.use('/api/auth', authRoutes);

// =================================================================
// ============== CORE SCANNING AND SAVING LOGIC ===================
// =================================================================
// We put the main logic in its own function so it can be reused.
async function runScanAndSave(userId: string, credentials: { accessKeyId: string; secretAccessKey: string; region: string }) {
  console.log(`SCANNER: Starting scan for user ${userId}...`);
  try {
    const [idleInstances, orphanedVolumes, unattachedEips] = await Promise.all([
      findIdleEC2Instances(credentials),
      findOrphanedEBSVolumes(credentials),
      findUnattachedEIPs(credentials),
    ]);
    console.log('SCANNER: Scans complete. Writing to database...');

    if (idleInstances.length > 0) {
      for (const instance of idleInstances) {
        await prisma.idleInstance.upsert({
          where: {
            instanceId_userId: {
              instanceId: instance.instanceId,
              userId: userId,
            },
          },
          update: { ...instance, userId },
          create: { ...instance, userId },
        });
      }
    }
    if (orphanedVolumes.length > 0) {
      for (const volume of orphanedVolumes) {
        await prisma.orphanedVolume.upsert({
          where: {
            volumeId_userId: {
              volumeId: volume.volumeId,
              userId: userId,
            },
          },
          update: { ...volume, userId },
          create: { ...volume, userId },
        });
      }
    }
    if (unattachedEips.length > 0) {
      for (const eip of unattachedEips) {
        await prisma.unattachedEIP.upsert({
          where: {
            allocationId_userId: {
              allocationId: eip.allocationId,
              userId: userId,
            },
          },
          update: { ...eip, userId },
          create: { ...eip, userId },
        });
      }
    }
    console.log('SCANNER: Successfully saved results to the database.');
  } catch (error) {
    console.error('SCANNER: Error during scheduled scan:', error);
    throw error;
  }
}


// =================================================================
// ======================= API ENDPOINTS ===========================
// =================================================================
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Protected endpoint - Get user's scan results
app.get('/api/results', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const [idleInstances, orphanedVolumes, unattachedEips] = await Promise.all([
      prisma.idleInstance.findMany({
        where: { userId },
      }),
      prisma.orphanedVolume.findMany({
        where: { userId },
      }),
      prisma.unattachedEIP.findMany({
        where: { userId },
      }),
    ]);

    res.status(200).json({
      message: 'Successfully retrieved saved scan results',
      data: { idleInstances, orphanedVolumes, unattachedEips },
    });
  } catch (error) {
    res.status(500).json({
      message: 'An error occurred while fetching results',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Protected endpoint - Get statistics for charts
app.get('/api/statistics', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const days = parseInt(req.query.days as string) || 30; // Default to last 30 days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all data for the user within the date range
    const [instances, volumes, eips] = await Promise.all([
      prisma.idleInstance.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.orphanedVolume.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.unattachedEIP.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Group by date
    const dateMap = new Map<string, {
      date: string;
      instances: number;
      volumes: number;
      eips: number;
      totalCost: number;
    }>();

    // Helper to format date as YYYY-MM-DD
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    // Process instances
    instances.forEach(instance => {
      const date = formatDate(instance.createdAt);
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          instances: 0,
          volumes: 0,
          eips: 0,
          totalCost: 0,
        });
      }
      const entry = dateMap.get(date)!;
      entry.instances += 1;
      const cost = instance.estimatedMonthlyCost 
        ? parseFloat(instance.estimatedMonthlyCost.replace('$', '')) 
        : 0;
      entry.totalCost += cost;
    });

    // Process volumes
    volumes.forEach(volume => {
      const date = formatDate(volume.createdAt);
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          instances: 0,
          volumes: 0,
          eips: 0,
          totalCost: 0,
        });
      }
      const entry = dateMap.get(date)!;
      entry.volumes += 1;
      const cost = volume.estimatedMonthlyCost 
        ? parseFloat(volume.estimatedMonthlyCost.replace('$', '')) 
        : 0;
      entry.totalCost += cost;
    });

    // Process EIPs
    eips.forEach(eip => {
      const date = formatDate(eip.createdAt);
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          instances: 0,
          volumes: 0,
          eips: 0,
          totalCost: 0,
        });
      }
      const entry = dateMap.get(date)!;
      entry.eips += 1;
    });

    // Convert to array and sort by date
    const statistics = Array.from(dateMap.values()).sort((a, b) => 
      a.date.localeCompare(b.date)
    );

    // Calculate cumulative totals
    let cumulativeInstances = 0;
    let cumulativeVolumes = 0;
    let cumulativeEips = 0;
    let cumulativeCost = 0;

    const statisticsWithCumulative = statistics.map(stat => {
      cumulativeInstances += stat.instances;
      cumulativeVolumes += stat.volumes;
      cumulativeEips += stat.eips;
      cumulativeCost += stat.totalCost;

      return {
        ...stat,
        cumulativeInstances,
        cumulativeVolumes,
        cumulativeEips,
        cumulativeCost: Math.round(cumulativeCost * 100) / 100,
      };
    });

    res.status(200).json({
      message: 'Statistics retrieved successfully',
      data: statisticsWithCumulative,
      summary: {
        totalInstances: cumulativeInstances,
        totalVolumes: cumulativeVolumes,
        totalEips: cumulativeEips,
        totalCost: Math.round(cumulativeCost * 100) / 100,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'An error occurred while fetching statistics',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Protected endpoint - Run scan for authenticated user
app.post('/api/scan', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Get user's AWS credentials
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        awsAccessKeyId: true,
        awsSecretAccessKey: true,
        awsRegion: true,
        awsConnected: true,
      },
    });

    if (!user || !user.awsConnected) {
      return res.status(400).json({
        message: 'AWS account not connected. Please connect your AWS account first.',
        error: 'AWS credentials not found',
      });
    }

    if (!user.awsAccessKeyId || !user.awsSecretAccessKey || !user.awsRegion) {
      return res.status(400).json({
        message: 'AWS credentials incomplete. Please reconnect your AWS account.',
        error: 'Incomplete AWS credentials',
      });
    }

    // Decrypt credentials
    const accessKeyId = decrypt(user.awsAccessKeyId);
    const secretAccessKey = decrypt(user.awsSecretAccessKey);

    if (!accessKeyId || !secretAccessKey) {
      return res.status(500).json({
        message: 'Error decrypting AWS credentials. Please reconnect your AWS account.',
        error: 'Decryption failed',
      });
    }

    // Run scan with user's credentials
    await runScanAndSave(userId, {
      accessKeyId,
      secretAccessKey,
      region: user.awsRegion,
    });

    res.status(200).json({ message: 'Manual scan triggered successfully. Results are being processed.' });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({
      message: 'An error occurred during the manual scan',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Authentication enabled. Users must login to access the dashboard.');
});