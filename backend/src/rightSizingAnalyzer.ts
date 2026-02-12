import {
    EC2Client,
    DescribeInstancesCommand,
    DescribeVolumesCommand,
    Instance
} from '@aws-sdk/client-ec2';
import { CloudWatchClient, GetMetricStatisticsCommand } from '@aws-sdk/client-cloudwatch';
import { AWSCredentials } from './awsScanner';

export interface RightSizingRecommendation {
    resourceId: string;
    resourceType: 'instance' | 'volume';
    currentType: string;
    recommendedType: string;
    currentCost: number;
    recommendedCost: number;
    monthlySavings: number;
    reason: string;
    confidence: 'high' | 'medium' | 'low';
    metrics?: {
        avgCpu?: number;
        avgMemory?: number;
        avgNetwork?: number;
        avgDiskIO?: number;
    };
}

/**
 * Analyze EC2 instances for right-sizing opportunities
 */
export async function analyzeEC2RightSizing(
    credentials: AWSCredentials
): Promise<RightSizingRecommendation[]> {
    console.log('Analyzing EC2 instances for right-sizing...');
    const { region, accessKeyId, secretAccessKey } = credentials;

    const ec2Client = new EC2Client({
        region,
        credentials: { accessKeyId, secretAccessKey },
    });

    const cloudWatchClient = new CloudWatchClient({
        region,
        credentials: { accessKeyId, secretAccessKey },
    });

    const recommendations: RightSizingRecommendation[] = [];

    try {
        // Get all running instances
        const command = new DescribeInstancesCommand({
            Filters: [{ Name: 'instance-state-name', Values: ['running'] }],
        });
        const { Reservations } = await ec2Client.send(command);
        const instances = Reservations?.flatMap(r => r.Instances || []) || [];

        for (const instance of instances) {
            if (!instance.InstanceId || !instance.InstanceType) continue;

            // Get CPU utilization over the last 14 days
            const avgCpu = await getAverageCpuUsage(instance.InstanceId, cloudWatchClient, 14);

            // Determine if downsizing is recommended
            const recommendation = determineInstanceRightSizing(
                instance,
                avgCpu,
                region
            );

            if (recommendation) {
                recommendations.push(recommendation);
            }
        }

        console.log(`Found ${recommendations.length} right-sizing recommendations`);
        return recommendations;
    } catch (error: any) {
        console.error('Error analyzing EC2 right-sizing:', error);
        return [];
    }
}

/**
 * Get average CPU usage over a period
 */
async function getAverageCpuUsage(
    instanceId: string,
    cloudWatchClient: CloudWatchClient,
    days: number = 14
): Promise<number> {
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - days);

    try {
        const command = new GetMetricStatisticsCommand({
            Namespace: 'AWS/EC2',
            MetricName: 'CPUUtilization',
            Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
            StartTime: startTime,
            EndTime: new Date(),
            Period: 86400, // 1 day
            Statistics: ['Average'],
        });

        const { Datapoints } = await cloudWatchClient.send(command);
        if (!Datapoints || Datapoints.length === 0) return 0;

        const sum = Datapoints.reduce((acc, dp) => acc + (dp.Average || 0), 0);
        return sum / Datapoints.length;
    } catch (error) {
        console.error(`Error getting CPU metrics for ${instanceId}:`, error);
        return 0;
    }
}

/**
 * Determine right-sizing recommendation for an instance
 */
function determineInstanceRightSizing(
    instance: Instance,
    avgCpu: number,
    region: string
): RightSizingRecommendation | null {
    const instanceType = instance.InstanceType!;
    const instanceId = instance.InstanceId!;

    // Instance type families and their downsizing paths
    const downsizingMap: Record<string, string> = {
        't3.large': 't3.medium',
        't3.xlarge': 't3.large',
        't3.2xlarge': 't3.xlarge',
        't2.large': 't2.medium',
        't2.xlarge': 't2.large',
        't2.2xlarge': 't2.xlarge',
        'm5.large': 'm5.medium',
        'm5.xlarge': 'm5.large',
        'm5.2xlarge': 'm5.xlarge',
        'm5.4xlarge': 'm5.2xlarge',
        'c5.large': 'c5.medium',
        'c5.xlarge': 'c5.large',
        'c5.2xlarge': 'c5.xlarge',
        'c5.4xlarge': 'c5.2xlarge',
    };

    // If CPU usage is consistently low (< 20%), recommend downsizing
    if (avgCpu < 20 && downsizingMap[instanceType]) {
        const recommendedType = downsizingMap[instanceType];

        // Calculate costs (simplified - would need actual pricing API)
        const currentCost = estimateInstanceCost(instanceType);
        const recommendedCost = estimateInstanceCost(recommendedType);
        const monthlySavings = currentCost - recommendedCost;

        return {
            resourceId: instanceId,
            resourceType: 'instance',
            currentType: instanceType,
            recommendedType,
            currentCost,
            recommendedCost,
            monthlySavings,
            reason: `Average CPU utilization is ${avgCpu.toFixed(1)}% over the last 14 days. Downsizing to ${recommendedType} can save costs while maintaining performance.`,
            confidence: avgCpu < 10 ? 'high' : avgCpu < 15 ? 'medium' : 'low',
            metrics: {
                avgCpu,
            },
        };
    }

    return null;
}

/**
 * Simplified cost estimation (in production, use actual pricing API)
 */
function estimateInstanceCost(instanceType: string): number {
    const costMap: Record<string, number> = {
        't3.medium': 30.37,
        't3.large': 60.74,
        't3.xlarge': 121.47,
        't3.2xlarge': 242.94,
        't2.medium': 33.87,
        't2.large': 67.74,
        't2.xlarge': 135.48,
        't2.2xlarge': 270.96,
        'm5.medium': 70.08,
        'm5.large': 140.16,
        'm5.xlarge': 280.32,
        'm5.2xlarge': 560.64,
        'm5.4xlarge': 1121.28,
        'c5.medium': 62.05,
        'c5.large': 124.10,
        'c5.xlarge': 248.20,
        'c5.2xlarge': 496.40,
        'c5.4xlarge': 992.80,
    };

    return costMap[instanceType] || 100; // Default fallback
}

/**
 * Analyze EBS volumes for optimization opportunities
 */
export async function analyzeEBSOptimization(
    credentials: AWSCredentials
): Promise<RightSizingRecommendation[]> {
    console.log('Analyzing EBS volumes for optimization...');
    const { region, accessKeyId, secretAccessKey } = credentials;

    const ec2Client = new EC2Client({
        region,
        credentials: { accessKeyId, secretAccessKey },
    });

    const recommendations: RightSizingRecommendation[] = [];

    try {
        const command = new DescribeVolumesCommand({});
        const { Volumes } = await ec2Client.send(command);

        if (!Volumes) return [];

        for (const volume of Volumes) {
            if (!volume.VolumeId || !volume.VolumeType) continue;

            // Recommend gp2 -> gp3 migration (gp3 is cheaper and faster)
            if (volume.VolumeType === 'gp2') {
                const currentCost = estimateVolumeCost('gp2', volume.Size || 0);
                const recommendedCost = estimateVolumeCost('gp3', volume.Size || 0);
                const monthlySavings = currentCost - recommendedCost;

                if (monthlySavings > 0) {
                    recommendations.push({
                        resourceId: volume.VolumeId,
                        resourceType: 'volume',
                        currentType: 'gp2',
                        recommendedType: 'gp3',
                        currentCost,
                        recommendedCost,
                        monthlySavings,
                        reason: `Migrating from gp2 to gp3 provides better performance at lower cost. gp3 offers 20% cost savings with the same baseline performance.`,
                        confidence: 'high',
                    });
                }
            }
        }

        console.log(`Found ${recommendations.length} EBS optimization recommendations`);
        return recommendations;
    } catch (error: any) {
        console.error('Error analyzing EBS optimization:', error);
        return [];
    }
}

/**
 * Simplified volume cost estimation
 */
function estimateVolumeCost(volumeType: string, sizeGb: number): number {
    const pricePerGb: Record<string, number> = {
        'gp2': 0.10, // $0.10 per GB-month
        'gp3': 0.08, // $0.08 per GB-month
        'io1': 0.125,
        'io2': 0.125,
        'st1': 0.045,
        'sc1': 0.015,
    };

    return (pricePerGb[volumeType] || 0.10) * sizeGb;
}

/**
 * Analyze Reserved Instance opportunities
 */
export async function analyzeReservedInstances(
    credentials: AWSCredentials
): Promise<RightSizingRecommendation[]> {
    console.log('Analyzing Reserved Instance opportunities...');
    // This would analyze usage patterns and recommend RI purchases
    // For now, returning empty array as this requires more complex analysis
    return [];
}
