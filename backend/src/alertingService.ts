import { PrismaClient } from '@prisma/client';
import {
    getEC2InstanceCost,
    getEBSVolumeCost
} from './costCalculator';

const prisma = new PrismaClient();

export interface AlertConfig {
    type: 'cost' | 'security' | 'utilization';
    threshold: number;
    channels: string[]; // ['email', 'slack']
}

/**
 * Check for alerts based on user configurations
 */
export async function checkAlerts(userId: string) {
    console.log(`Checking alerts for user ${userId}...`);

    const configs = await prisma.alertConfiguration.findMany({
        where: { userId, enabled: true },
    });

    if (configs.length === 0) return;

    for (const config of configs) {
        if (config.type === 'cost') {
            await checkCostAlert(userId, config);
        } else if (config.type === 'security') {
            await checkSecurityAlert(userId, config);
        }
        // Add other types as needed
    }
}

async function checkCostAlert(userId: string, config: any) {
    // Calculate total estimated monthly cost
    const instances = await prisma.idleInstance.findMany({ where: { userId } });
    const volumes = await prisma.orphanedVolume.findMany({ where: { userId } });

    let totalCost = 0;

    // Parse costs (assuming stored as "$10.00")
    const parseCost = (cost: string | null) => {
        if (!cost) return 0;
        return parseFloat(cost.replace('$', ''));
    };

    instances.forEach(i => totalCost += parseCost(i.estimatedMonthlyCost));
    volumes.forEach(v => totalCost += parseCost(v.estimatedMonthlyCost));

    if (totalCost > (config.threshold || 100)) {
        await createAlert(
            userId,
            'High Cost Detected',
            `Your estimated wasted cost ($${totalCost.toFixed(2)}) has exceeded your threshold of $${config.threshold}.`,
            'high'
        );
    }
}

async function checkSecurityAlert(userId: string, config: any) {
    const issues = await prisma.securityGroupIssue.findMany({
        where: { userId, severity: 'High' }
    });

    if (issues.length > 0) {
        await createAlert(
            userId,
            'Critical Security Issues Detected',
            `Found ${issues.length} high-severity security issues in your account.`,
            'critical'
        );
    }
}

export async function createAlert(
    userId: string,
    title: string,
    message: string,
    severity: 'critical' | 'high' | 'medium' | 'low'
) {
    // Check if similar unread alert already exists to avoid spam
    const existing = await prisma.alert.findFirst({
        where: {
            userId,
            title,
            isRead: false,
            createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        }
    });

    if (existing) return;

    await prisma.alert.create({
        data: {
            userId,
            title,
            message,
            severity
        }
    });

    console.log(`Alert created for user ${userId}: ${title}`);

    // Here we would send Email/Slack based on user settings
    // await sendNotification(userId, title, message);
}

export async function sendTestAlert(userId: string, channel: string) {
    await createAlert(userId, 'Test Alert', `This is a test alert sent to ${channel}`, 'low');
    return { success: true };
}
