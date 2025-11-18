# 🔍 AWS Scanning Troubleshooting Guide

## Why Instances Might Not Show Up

### **Common Issues:**

1. **CloudWatch Data Not Available**
   - New instances (< 5 minutes old) don't have CloudWatch metrics yet
   - Detailed monitoring might be disabled
   - Solution: The scanner now flags these instances with a special message

2. **Instance Not Idle**
   - Scanner only shows instances with CPU < 5% over 7 days
   - If CPU is above 5%, instance won't appear
   - Solution: This is working as designed - only idle instances are shown

3. **IAM Permissions Missing**
   - AWS credentials need specific permissions
   - Solution: See IAM permissions below

4. **Wrong Region**
   - Instances are region-specific
   - Solution: Make sure you select the correct AWS region

5. **Error Handling**
   - Errors might be silently failing
   - Solution: Improved error handling added

---

## 🔐 Required AWS IAM Permissions

Your AWS IAM user needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:DescribeVolumes",
        "ec2:DescribeAddresses",
        "ec2:DescribeInstanceStatus",
        "cloudwatch:GetMetricData",
        "cloudwatch:GetMetricStatistics",
        "pricing:GetProducts"
      ],
      "Resource": "*"
    }
  ]
}
```

### **How to Add Permissions:**

1. Go to AWS Console → IAM
2. Select your IAM user
3. Click "Add permissions" → "Attach policies directly"
4. Create a custom policy with the JSON above
5. Or attach these managed policies:
   - `AmazonEC2ReadOnlyAccess`
   - `CloudWatchReadOnlyAccess`
   - `AWSPriceListServiceFullAccess`

---

## 🛠️ Improvements Made

### **1. Better Error Handling**
- Errors are now properly caught and reported
- User-friendly error messages
- Detailed logging for debugging

### **2. CloudWatch Data Handling**
- Handles cases where CloudWatch data isn't available
- Flags instances without monitoring data
- Doesn't fail silently

### **3. Background Processing**
- Scans run in background (non-blocking)
- Users get immediate response
- Results appear after scan completes

### **4. Better Logging**
- More detailed console logs
- Error messages include context
- Easier to debug issues

---

## 🧪 Testing Your AWS Credentials

### **Test Script:**

Create `backend/src/scripts/testAWS.ts`:

```typescript
import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

async function testAWS() {
  const client = new EC2Client({
    region: "us-east-1", // Your region
    credentials: {
      accessKeyId: "YOUR_ACCESS_KEY",
      secretAccessKey: "YOUR_SECRET_KEY",
    },
  });

  try {
    const command = new DescribeInstancesCommand({});
    const response = await client.send(command);
    console.log("✅ AWS connection successful!");
    console.log(`Found ${response.Reservations?.length || 0} reservations`);
  } catch (error) {
    console.error("❌ AWS connection failed:", error);
  }
}

testAWS();
```

---

## 📊 What Gets Scanned

### **Idle EC2 Instances:**
- Only **running** instances
- CPU usage < 5% over last 7 days
- Includes instances without CloudWatch data

### **Orphaned EBS Volumes:**
- Volumes with status "available" (not attached)

### **Unattached Elastic IPs:**
- EIPs not associated with any resource

---

## 🔄 How to Debug

1. **Check Backend Logs:**
   ```bash
   cd backend
   npm run dev
   # Watch console for detailed logs
   ```

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Check Network tab for API responses
   - Check Console for errors

3. **Test AWS Credentials:**
   - Use AWS CLI: `aws ec2 describe-instances --region us-east-1`
   - Verify credentials work independently

4. **Verify Region:**
   - Make sure you selected the correct region
   - Instances are region-specific

---

## ✅ Checklist

- [ ] AWS credentials are correct
- [ ] IAM permissions are set correctly
- [ ] Correct AWS region selected
- [ ] Instances are actually running
- [ ] CloudWatch monitoring is enabled (optional but recommended)
- [ ] Backend logs show no errors
- [ ] Network requests succeed (check browser DevTools)

---

## 🚀 Next Steps

If instances still don't show:
1. Check backend console logs
2. Verify AWS credentials manually
3. Test IAM permissions
4. Check if instances are in the selected region
5. Verify instances are actually running





