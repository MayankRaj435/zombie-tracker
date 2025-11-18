# Resource Access Plan - How Users See Their Resources

## 🤔 Current Situation

**Right now:**
- Single AWS account configured in backend `.env` file
- All scans use the same AWS credentials
- All users would see the **same shared scan results**
- AWS credentials: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`

---

## 🎯 Three Possible Approaches

### **Option 1: Shared AWS Account (Simplest)**
**How it works:**
- One AWS account configured on the backend (admin account)
- All authenticated users see the **same scan results**
- Users just login to view the dashboard
- No AWS credentials needed from users

**User Flow:**
```
1. User logs in → Dashboard
2. User sees shared AWS resources (from admin account)
3. All users see the same idle instances, volumes, EIPs
4. "Run Scan" button triggers scan using admin AWS credentials
```

**Pros:**
- ✅ Simplest to implement
- ✅ No need for users to provide AWS credentials
- ✅ Good for team/organization monitoring one AWS account
- ✅ Fast to build

**Cons:**
- ❌ Not user-specific (all see same data)
- ❌ Not suitable for multi-tenant SaaS
- ❌ Users can't monitor their own AWS accounts

**Best for:**
- Internal team tool
- Monitoring a single organization's AWS account
- Quick MVP/prototype

---

### **Option 2: User-Specific AWS Accounts (Most Realistic)**
**How it works:**
- Each user connects their own AWS account
- Users provide AWS credentials (encrypted in database)
- Each user sees **only their own resources**
- Scans run per user with their credentials

**User Flow:**
```
1. User logs in → Dashboard (empty initially)
2. User sees "Connect AWS Account" button
3. User enters:
   - AWS Access Key ID
   - AWS Secret Access Key
   - AWS Region
4. Credentials encrypted and stored in database
5. User can now see their own resources
6. "Run Scan" uses user's AWS credentials
```

**Database Schema Addition:**
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String
  name          String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // AWS Credentials (encrypted)
  awsAccessKeyId     String?  // Encrypted
  awsSecretAccessKey String?  // Encrypted
  awsRegion         String?  // e.g., "us-east-1"
  awsConnected     Boolean  @default(false)
  awsConnectedAt    DateTime?
}
```

**Pros:**
- ✅ True multi-tenant SaaS
- ✅ Each user sees their own resources
- ✅ Scalable for many users
- ✅ More realistic for production

**Cons:**
- ❌ More complex to implement
- ❌ Need to securely store AWS credentials
- ❌ Users need to provide AWS credentials
- ❌ Need encryption for credentials

**Best for:**
- Production SaaS product
- Multi-tenant application
- Users monitoring their own AWS accounts

---

### **Option 3: Hybrid Approach (Flexible)**
**How it works:**
- Default: Shared admin AWS account (all users see same data)
- Optional: Users can connect their own AWS account
- Users can switch between "Shared View" and "My Account View"

**User Flow:**
```
1. User logs in → Dashboard (shows shared resources by default)
2. User can optionally click "Connect My AWS Account"
3. User enters AWS credentials
4. User can toggle between:
   - "Shared Resources" (admin account)
   - "My Resources" (user's own account)
```

**Pros:**
- ✅ Flexible - works for both shared and individual use
- ✅ Users can choose what they want to see
- ✅ Good for organizations with multiple AWS accounts

**Cons:**
- ❌ Most complex to implement
- ❌ Need to handle switching between accounts
- ❌ More UI complexity

**Best for:**
- Organizations with multiple AWS accounts
- Teams that want both shared and individual views

---

## 🔐 Security Considerations

### **For Option 2 & 3 (User AWS Credentials):**

**Credential Storage:**
- ✅ Encrypt AWS credentials before storing in database
- ✅ Use encryption library (e.g., `crypto` with AES-256)
- ✅ Never log or expose credentials
- ✅ Use environment variable for encryption key

**Credential Usage:**
- ✅ Decrypt only when needed for scanning
- ✅ Never send credentials to frontend
- ✅ Store decrypted credentials in memory only (never in logs)
- ✅ Clear credentials from memory after use

**Example Encryption:**
```typescript
// Encrypt before storing
const encryptedKey = encrypt(awsAccessKeyId, ENCRYPTION_KEY);
const encryptedSecret = encrypt(awsSecretAccessKey, ENCRYPTION_KEY);

// Decrypt when needed
const decryptedKey = decrypt(encryptedKey, ENCRYPTION_KEY);
const decryptedSecret = decrypt(encryptedSecret, ENCRYPTION_KEY);
```

---

## 📊 Database Schema Comparison

### **Option 1 (Shared):**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  // No AWS credentials needed
}
```

### **Option 2 (User-Specific):**
```prisma
model User {
  id                  String   @id @default(cuid())
  email               String   @unique
  password            String
  name                String?
  awsAccessKeyId      String?  // Encrypted
  awsSecretAccessKey  String?  // Encrypted
  awsRegion           String?
  awsConnected        Boolean  @default(false)
  awsConnectedAt       DateTime?
}

model ScanResult {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  scanType      String   // "full", "instances", "volumes", "eips"
  status        String   // "completed", "failed", "running"
  createdAt     DateTime @default(now())
  
  // Link to specific resources found
  idleInstances     IdleInstance[]
  orphanedVolumes   OrphanedVolume[]
  unattachedEips    UnattachedEIP[]
}
```

---

## 🔄 Scan Flow Comparison

### **Option 1 (Shared):**
```
User clicks "Run Scan"
  ↓
Backend uses admin AWS credentials (from .env)
  ↓
Scan runs with admin credentials
  ↓
Results saved to shared database tables
  ↓
All users see same results
```

### **Option 2 (User-Specific):**
```
User clicks "Run Scan"
  ↓
Backend gets user's encrypted AWS credentials
  ↓
Decrypt credentials
  ↓
Scan runs with user's AWS credentials
  ↓
Results saved with userId (user-specific)
  ↓
Only that user sees their results
```

---

## 💡 My Recommendation

**For MVP/Initial Version:**
- **Start with Option 1 (Shared Account)**
- Simple, fast to implement
- Good for testing and validation
- Can upgrade to Option 2 later

**For Production SaaS:**
- **Use Option 2 (User-Specific Accounts)**
- True multi-tenant solution
- Each user monitors their own AWS account
- More realistic and scalable

---

## 🎯 Questions for You

1. **What's your use case?**
   - Internal team tool? → Option 1
   - Public SaaS product? → Option 2
   - Organization with multiple accounts? → Option 3

2. **Who will use this?**
   - Single organization/team? → Option 1
   - Multiple customers/users? → Option 2

3. **Do users have their own AWS accounts?**
   - Yes → Option 2 or 3
   - No (shared account) → Option 1

4. **Timeline/Complexity?**
   - Need it fast? → Option 1
   - Can invest time? → Option 2

5. **Security requirements?**
   - High security needed? → Option 2 (with encryption)
   - Internal use only? → Option 1

---

## 🚀 Implementation Impact

### **If Option 1 (Shared):**
- ✅ Minimal changes to current code
- ✅ Just add authentication
- ✅ Keep existing scan logic
- ✅ All users see same results

### **If Option 2 (User-Specific):**
- ⚠️ Need to add AWS credential storage
- ⚠️ Need encryption for credentials
- ⚠️ Modify scan functions to accept credentials
- ⚠️ Add userId to all database models
- ⚠️ Filter results by userId
- ⚠️ Add "Connect AWS Account" UI

### **If Option 3 (Hybrid):**
- ⚠️ All of Option 2 changes
- ⚠️ Plus UI for switching views
- ⚠️ Plus logic to handle both shared and user-specific

---

**Which option do you prefer?** Once you decide, I'll update the authentication plan accordingly! 🎯








