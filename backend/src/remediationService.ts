import {
    EC2Client,
    StopInstancesCommand,
    TerminateInstancesCommand,
    CreateSnapshotCommand,
    DeleteVolumeCommand,
    ReleaseAddressCommand,
    DescribeVolumesCommand
} from '@aws-sdk/client-ec2';
import { AWSCredentials } from './awsScanner';

export interface RemediationAction {
    resourceId: string;
    resourceType: 'instance' | 'volume' | 'eip';
    action: 'stop' | 'terminate' | 'delete' | 'release';
    timestamp: Date;
    status: 'pending' | 'success' | 'failed';
    error?: string;
}

export interface ScheduledAction {
    resourceId: string;
    action: 'stop' | 'start';
    schedule: string; // Cron expression
    enabled: boolean;
}

/**
 * Stop an EC2 instance
 */
export async function stopInstance(
    credentials: AWSCredentials,
    instanceId: string
): Promise<RemediationAction> {
    console.log(`Stopping instance: ${instanceId}`);
    const { region, accessKeyId, secretAccessKey } = credentials;

    const ec2Client = new EC2Client({
        region,
        credentials: { accessKeyId, secretAccessKey },
    });

    try {
        const command = new StopInstancesCommand({
            InstanceIds: [instanceId],
        });

        await ec2Client.send(command);

        return {
            resourceId: instanceId,
            resourceType: 'instance',
            action: 'stop',
            timestamp: new Date(),
            status: 'success',
        };
    } catch (error: any) {
        console.error(`Error stopping instance ${instanceId}:`, error);
        return {
            resourceId: instanceId,
            resourceType: 'instance',
            action: 'stop',
            timestamp: new Date(),
            status: 'failed',
            error: error.message,
        };
    }
}

/**
 * Terminate an EC2 instance
 */
export async function terminateInstance(
    credentials: AWSCredentials,
    instanceId: string
): Promise<RemediationAction> {
    console.log(`Terminating instance: ${instanceId}`);
    const { region, accessKeyId, secretAccessKey } = credentials;

    const ec2Client = new EC2Client({
        region,
        credentials: { accessKeyId, secretAccessKey },
    });

    try {
        const command = new TerminateInstancesCommand({
            InstanceIds: [instanceId],
        });

        await ec2Client.send(command);

        return {
            resourceId: instanceId,
            resourceType: 'instance',
            action: 'terminate',
            timestamp: new Date(),
            status: 'success',
        };
    } catch (error: any) {
        console.error(`Error terminating instance ${instanceId}:`, error);
        return {
            resourceId: instanceId,
            resourceType: 'instance',
            action: 'terminate',
            timestamp: new Date(),
            status: 'failed',
            error: error.message,
        };
    }
}

/**
 * Create a snapshot of an EBS volume before deletion
 */
export async function createVolumeSnapshot(
    credentials: AWSCredentials,
    volumeId: string
): Promise<string | null> {
    console.log(`Creating snapshot for volume: ${volumeId}`);
    const { region, accessKeyId, secretAccessKey } = credentials;

    const ec2Client = new EC2Client({
        region,
        credentials: { accessKeyId, secretAccessKey },
    });

    try {
        const command = new CreateSnapshotCommand({
            VolumeId: volumeId,
            Description: `Snapshot before deletion - ${new Date().toISOString()}`,
        });

        const response = await ec2Client.send(command);
        console.log(`Snapshot created: ${response.SnapshotId}`);
        return response.SnapshotId || null;
    } catch (error: any) {
        console.error(`Error creating snapshot for volume ${volumeId}:`, error);
        return null;
    }
}

/**
 * Delete an EBS volume (with optional snapshot)
 */
export async function deleteVolume(
    credentials: AWSCredentials,
    volumeId: string,
    createSnapshot: boolean = true
): Promise<RemediationAction> {
    console.log(`Deleting volume: ${volumeId} (snapshot: ${createSnapshot})`);
    const { region, accessKeyId, secretAccessKey } = credentials;

    const ec2Client = new EC2Client({
        region,
        credentials: { accessKeyId, secretAccessKey },
    });

    try {
        // Create snapshot if requested
        if (createSnapshot) {
            const snapshotId = await createVolumeSnapshot(credentials, volumeId);
            if (!snapshotId) {
                console.warn(`Failed to create snapshot for ${volumeId}, proceeding with deletion anyway`);
            }
        }

        // Delete the volume
        const command = new DeleteVolumeCommand({
            VolumeId: volumeId,
        });

        await ec2Client.send(command);

        return {
            resourceId: volumeId,
            resourceType: 'volume',
            action: 'delete',
            timestamp: new Date(),
            status: 'success',
        };
    } catch (error: any) {
        console.error(`Error deleting volume ${volumeId}:`, error);
        return {
            resourceId: volumeId,
            resourceType: 'volume',
            action: 'delete',
            timestamp: new Date(),
            status: 'failed',
            error: error.message,
        };
    }
}

/**
 * Release an Elastic IP
 */
export async function releaseElasticIP(
    credentials: AWSCredentials,
    allocationId: string
): Promise<RemediationAction> {
    console.log(`Releasing Elastic IP: ${allocationId}`);
    const { region, accessKeyId, secretAccessKey } = credentials;

    const ec2Client = new EC2Client({
        region,
        credentials: { accessKeyId, secretAccessKey },
    });

    try {
        const command = new ReleaseAddressCommand({
            AllocationId: allocationId,
        });

        await ec2Client.send(command);

        return {
            resourceId: allocationId,
            resourceType: 'eip',
            action: 'release',
            timestamp: new Date(),
            status: 'success',
        };
    } catch (error: any) {
        console.error(`Error releasing Elastic IP ${allocationId}:`, error);
        return {
            resourceId: allocationId,
            resourceType: 'eip',
            action: 'release',
            timestamp: new Date(),
            status: 'failed',
            error: error.message,
        };
    }
}

/**
 * Bulk terminate instances
 */
export async function bulkTerminateInstances(
    credentials: AWSCredentials,
    instanceIds: string[]
): Promise<RemediationAction[]> {
    console.log(`Bulk terminating ${instanceIds.length} instances`);

    const results = await Promise.all(
        instanceIds.map(id => terminateInstance(credentials, id))
    );

    return results;
}

/**
 * Bulk delete volumes
 */
export async function bulkDeleteVolumes(
    credentials: AWSCredentials,
    volumeIds: string[],
    createSnapshots: boolean = true
): Promise<RemediationAction[]> {
    console.log(`Bulk deleting ${volumeIds.length} volumes`);

    const results = await Promise.all(
        volumeIds.map(id => deleteVolume(credentials, id, createSnapshots))
    );

    return results;
}
