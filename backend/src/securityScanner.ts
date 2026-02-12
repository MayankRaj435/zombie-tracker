import { EC2Client, DescribeSecurityGroupsCommand, SecurityGroup } from "@aws-sdk/client-ec2";
import { S3Client, ListBucketsCommand, GetBucketEncryptionCommand, GetBucketVersioningCommand, GetPublicAccessBlockCommand } from "@aws-sdk/client-s3";
import { IAMClient, ListRolesCommand, ListAttachedRolePoliciesCommand } from "@aws-sdk/client-iam";
import { AWSCredentials } from "./awsScanner";

export interface SecurityIssue {
    groupId?: string;
    groupName?: string;
    resourceId?: string; // For S3/IAM
    resourceType?: string; // "SecurityGroup", "S3Bucket", "IAMRole"
    description: string;
    severity: "High" | "Medium" | "Low";
}

export async function findInsecureSecurityGroups(credentials: AWSCredentials): Promise<SecurityIssue[]> {
    console.log("Starting scan for security issues (SG, S3, IAM)...");
    const issues: SecurityIssue[] = [];

    // Run scans in parallel
    const [sgIssues, s3Issues, iamIssues] = await Promise.all([
        scanSecurityGroups(credentials),
        scanS3Buckets(credentials),
        scanIAMPolicies(credentials)
    ]);

    return [...sgIssues, ...s3Issues, ...iamIssues];
}

async function scanSecurityGroups(credentials: AWSCredentials): Promise<SecurityIssue[]> {
    const { region, accessKeyId, secretAccessKey } = credentials;
    const ec2Client = new EC2Client({ region, credentials: { accessKeyId, secretAccessKey } });
    const issues: SecurityIssue[] = [];

    try {
        const { SecurityGroups } = await ec2Client.send(new DescribeSecurityGroupsCommand({}));
        if (!SecurityGroups) return [];

        for (const sg of SecurityGroups) {
            if (!sg.IpPermissions) continue;
            for (const perm of sg.IpPermissions) {
                const isOpenToWorld = perm.IpRanges?.some(range => range.CidrIp === "0.0.0.0/0");
                if (isOpenToWorld) {
                    const fromPort = perm.FromPort ?? -1;
                    const toPort = perm.ToPort ?? -1;

                    if (fromPort === -1 || (fromPort <= 22 && toPort >= 22)) {
                        issues.push({
                            groupId: sg.GroupId,
                            groupName: sg.GroupName,
                            resourceId: sg.GroupId,
                            resourceType: "SecurityGroup",
                            description: "Port 22 (SSH) is open to the world (0.0.0.0/0). High security risk.",
                            severity: "High"
                        });
                    }
                    if (fromPort === -1 || (fromPort <= 3389 && toPort >= 3389)) {
                        issues.push({
                            groupId: sg.GroupId,
                            groupName: sg.GroupName,
                            resourceId: sg.GroupId,
                            resourceType: "SecurityGroup",
                            description: "Port 3389 (RDP) is open to the world (0.0.0.0/0). High security risk.",
                            severity: "High"
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error("SG Scan Error:", error);
    }
    return issues;
}

async function scanS3Buckets(credentials: AWSCredentials): Promise<SecurityIssue[]> {
    const { region, accessKeyId, secretAccessKey } = credentials;
    const s3Client = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
    const issues: SecurityIssue[] = [];

    try {
        const { Buckets } = await s3Client.send(new ListBucketsCommand({}));
        if (!Buckets) return [];

        for (const bucket of Buckets) {
            if (!bucket.Name) continue;
            const bucketName = bucket.Name;

            // Check Encryption
            try {
                await s3Client.send(new GetBucketEncryptionCommand({ Bucket: bucketName }));
            } catch (err: any) {
                if (err.name === 'ServerSideEncryptionConfigurationNotFoundError') {
                    issues.push({
                        resourceId: bucketName,
                        resourceType: "S3Bucket",
                        description: `S3 Bucket ${bucketName} does not have default encryption enabled.`,
                        severity: "Medium"
                    });
                }
            }

            // Check Versioning
            try {
                const versioning = await s3Client.send(new GetBucketVersioningCommand({ Bucket: bucketName }));
                if (!versioning.Status || versioning.Status === 'Suspended') {
                    issues.push({
                        resourceId: bucketName,
                        resourceType: "S3Bucket",
                        description: `S3 Bucket ${bucketName} does not have versioning enabled.`,
                        severity: "Low"
                    });
                }
            } catch (err) { }

            // Check Public Access Block (Simplified - if it errors or is missing, assume potential risk)
            try {
                await s3Client.send(new GetPublicAccessBlockCommand({ Bucket: bucketName }));
            } catch (err: any) {
                if (err.name === 'NoSuchPublicAccessBlockConfiguration') {
                    issues.push({
                        resourceId: bucketName,
                        resourceType: "S3Bucket",
                        description: `S3 Bucket ${bucketName} does not have Block Public Access enabled.`,
                        severity: "High"
                    });
                }
            }
        }
    } catch (error) {
        console.error("S3 Scan Error:", error);
    }
    return issues;
}

async function scanIAMPolicies(credentials: AWSCredentials): Promise<SecurityIssue[]> {
    const { region, accessKeyId, secretAccessKey } = credentials;
    const iamClient = new IAMClient({ region, credentials: { accessKeyId, secretAccessKey } });
    const issues: SecurityIssue[] = [];

    try {
        const { Roles } = await iamClient.send(new ListRolesCommand({}));
        if (!Roles) return [];

        for (const role of Roles) {
            if (!role.RoleName) continue;

            // Check for AdministratorAccess
            const { AttachedPolicies } = await iamClient.send(new ListAttachedRolePoliciesCommand({ RoleName: role.RoleName }));
            const hasAdmin = AttachedPolicies?.some(p => p.PolicyName === 'AdministratorAccess');

            if (hasAdmin) {
                issues.push({
                    resourceId: role.RoleName,
                    resourceType: "IAMRole",
                    description: `IAM Role ${role.RoleName} has AdministratorAccess. Verify if this high-privileged access is necessary.`,
                    severity: "Medium" // Medium because it might be intentional
                });
            }
        }
    } catch (error) {
        console.error("IAM Scan Error:", error);
    }
    return issues;
}
