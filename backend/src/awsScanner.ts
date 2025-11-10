import { EC2Client, DescribeInstancesCommand, Instance, DescribeVolumesCommand, DescribeAddressesCommand } from "@aws-sdk/client-ec2";
import { CloudWatchClient, GetMetricDataCommand } from "@aws-sdk/client-cloudwatch";
// Import our new cost calculator functions
import { getEC2InstanceCost, getEBSVolumeCost } from "./costCalculator";

export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

const IDLE_THRESHOLD_PERCENT = 5;

export async function findIdleEC2Instances(credentials: AWSCredentials) {
  console.log("Starting scan for idle EC2 instances...");
  const flaggedInstances = [];
  const { region, accessKeyId, secretAccessKey } = credentials;

  // Create clients with user credentials
  const ec2Client = new EC2Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const cloudWatchClient = new CloudWatchClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  try {
    const command = new DescribeInstancesCommand({
      Filters: [{ Name: "instance-state-name", Values: ["running"] }],
    });
    const { Reservations } = await ec2Client.send(command);
    const instances = Reservations?.flatMap(r => r.Instances || []) || [];

    if (instances.length === 0) {
      console.log("No running instances found.");
      return [];
    }
    console.log(`Found ${instances.length} running instances. Analyzing...`);

    for (const instance of instances) {
      if (!instance.InstanceId || !instance.InstanceType) continue;
      
      const avgCpu = await getAverageCpuUsage(instance.InstanceId, cloudWatchClient);
      console.log(`Instance ${instance.InstanceId} has average CPU of ${avgCpu.toFixed(2)}%`);

      if (avgCpu < IDLE_THRESHOLD_PERCENT) {
        // === COST CALCULATION ADDED HERE ===
        const cost = await getEC2InstanceCost(instance.InstanceType, region);
        console.log(`Estimated monthly cost for ${instance.InstanceId}: ${cost}`);
        
        flaggedInstances.push({
          instanceId: instance.InstanceId,
          instanceType: instance.InstanceType,
          reason: `Average CPU usage over the last 7 days was ${avgCpu.toFixed(2)}%, which is below the ${IDLE_THRESHOLD_PERCENT}% threshold.`,
          estimatedMonthlyCost: cost,
        });
      }
    }
    
    console.log(`Scan complete. Found ${flaggedInstances.length} idle instances.`);
    return flaggedInstances;
  } catch (error) {
    console.error("Error scanning for idle instances:", error);
    throw error;
  }
}

async function getAverageCpuUsage(instanceId: string, cloudWatchClient: CloudWatchClient): Promise<number> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const command = new GetMetricDataCommand({
    StartTime: sevenDaysAgo,
    EndTime: new Date(),
    MetricDataQueries: [
      {
        Id: "m1",
        MetricStat: {
          Metric: {
            Namespace: "AWS/EC2",
            MetricName: "CPUUtilization",
            Dimensions: [{ Name: "InstanceId", Value: instanceId }],
          },
          Period: 86400,
          Stat: "Average",
        },
        ReturnData: true,
      },
    ],
  });

  const { MetricDataResults } = await cloudWatchClient.send(command);
  const values = MetricDataResults?.[0]?.Values || [];
  if (values.length === 0) {
    return 0;
  }
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

export async function findOrphanedEBSVolumes(credentials: AWSCredentials) {
  console.log("Starting scan for orphaned EBS volumes...");
  const { region, accessKeyId, secretAccessKey } = credentials;

  const ec2Client = new EC2Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  try {
    const command = new DescribeVolumesCommand({
      Filters: [{ Name: "status", Values: ["available"] }],
    });
    const { Volumes } = await ec2Client.send(command);
    if (!Volumes || Volumes.length === 0) {
      console.log("No orphaned volumes found.");
      return [];
    }
    console.log(`Found ${Volumes.length} orphaned volumes.`);

    // Use Promise.all to fetch costs in parallel for better performance
    const flaggedVolumesPromises = Volumes.map(async (volume) => {
      if (!volume.VolumeType || !volume.Size || !volume.VolumeId) return null;
      
      // === COST CALCULATION ADDED HERE ===
      const cost = await getEBSVolumeCost(volume.VolumeType, volume.Size, region);
      console.log(`Estimated monthly cost for ${volume.VolumeId}: ${cost}`);

      return {
        volumeId: volume.VolumeId,
        sizeGb: volume.Size,
        volumeType: volume.VolumeType,
        reason: `This volume is 'available' and not attached to any EC2 instance.`,
        estimatedMonthlyCost: cost,
      };
    });

    const flaggedVolumes = (await Promise.all(flaggedVolumesPromises)).filter(v => v !== null);
    
    return flaggedVolumes as NonNullable<typeof flaggedVolumes[number]>[];
  } catch (error) {
    console.error("Error scanning for orphaned volumes:", error);
    throw error;
  }
}

// NOTE: We are not calculating cost for EIPs yet, as it's a fixed price.
// We can add this later if needed. The cost is approx $3.65/month.
export async function findUnattachedEIPs(credentials: AWSCredentials) {
  console.log("Starting scan for unattached Elastic IPs...");
  const { region, accessKeyId, secretAccessKey } = credentials;

  const ec2Client = new EC2Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  try {
    const command = new DescribeAddressesCommand({});
    const { Addresses } = await ec2Client.send(command);

    if (!Addresses || Addresses.length === 0) {
      console.log("No Elastic IPs found.");
      return [];
    }

    const flaggedEIPs = Addresses
      .filter(addr => !addr.AssociationId)
      .map(addr => ({
        publicIp: addr.PublicIp,
        allocationId: addr.AllocationId!,
        reason: "This Elastic IP is not associated with any resource.",
      }));
    
    console.log(`Scan complete. Found ${flaggedEIPs.length} unattached Elastic IPs.`);
    return flaggedEIPs;
  } catch (error) {
    console.error("Error scanning for unattached EIPs:", error);
    throw error;
  }
}
