# Authentication Setup Instructions

## ✅ Implementation Complete!

The authentication system with **Option 2: User-Specific AWS Accounts** has been fully implemented. Here's what you need to do to get it running:

---

## 🔧 Backend Setup

### 1. **Run Database Migration**

The Prisma schema has been updated with the User model. You need to create and run the migration:

```bash
cd backend
npx prisma migrate dev --name add_user_authentication
```

This will:
- Create the `User` table
- Add `userId` foreign keys to `IdleInstance`, `OrphanedVolume`, and `UnattachedEIP` tables
- Update the database schema

### 2. **Add Environment Variables**

Add these to your `backend/.env` file:

```env
# Existing variables
DATABASE_URL="postgresql://..."
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="..."  # Optional now (users provide their own)
AWS_SECRET_ACCESS_KEY="..."  # Optional now (users provide their own)

# New authentication variables
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"
ENCRYPTION_KEY="your-encryption-key-for-aws-credentials-change-this"
```

**Important:** 
- Use strong, random strings for `JWT_SECRET` and `ENCRYPTION_KEY`
- Never commit these to version control
- Use different keys for production

### 3. **Start Backend Server**

```bash
cd backend
npm run dev
```

---

## 🎨 Frontend Setup

### 1. **Start Frontend Server**

```bash
cd frontend
npm run dev
```

---

## 🚀 How It Works

### **User Flow:**

1. **First-Time User:**
   - Visit app → Redirected to `/login`
   - Click "Create Account" → Fill registration form
   - Account created → Auto-logged in → Redirected to `/dashboard`
   - Dashboard shows "Connect AWS Account" form
   - User enters AWS credentials → Credentials encrypted and stored
   - User can now run scans and see their resources

2. **Returning User:**
   - Visit app → Redirected to `/login`
   - Enter email & password → Login → Redirected to `/dashboard`
   - If AWS connected → See dashboard with resources
   - If AWS not connected → See "Connect AWS Account" form

### **Features:**

✅ **User Registration & Login**
- Secure password hashing with bcrypt
- JWT token authentication
- Token stored in localStorage

✅ **AWS Account Connection**
- Users provide their own AWS credentials
- Credentials encrypted before storage
- Each user sees only their own resources

✅ **Protected Routes**
- Dashboard requires authentication
- Auto-redirect to login if not authenticated
- Token validation on every request

✅ **User-Specific Scans**
- Each user's scans use their own AWS credentials
- Results filtered by userId
- No data leakage between users

---

## 📡 API Endpoints

### **Public Endpoints:**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### **Protected Endpoints (require JWT token):**
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/connect-aws` - Connect AWS account
- `POST /api/auth/disconnect-aws` - Disconnect AWS account
- `GET /api/results` - Get user's scan results
- `POST /api/scan` - Run scan with user's AWS credentials

---

## 🔒 Security Features

✅ **Password Security:**
- Passwords hashed with bcrypt (10 salt rounds)
- Minimum 8 characters required

✅ **Token Security:**
- JWT tokens signed with secret key
- 24-hour expiration (configurable)
- Token stored in localStorage

✅ **AWS Credentials Security:**
- Credentials encrypted with AES before storage
- Decrypted only when needed for scanning
- Never sent to frontend
- Never logged

---

## 🐛 Troubleshooting

### **Database Migration Issues:**
If you have existing data, you may need to:
1. Backup your database
2. Clear existing data (or migrate it manually)
3. Run the migration

### **Token Issues:**
- Clear localStorage if you get authentication errors
- Check that `JWT_SECRET` is set in `.env`
- Verify token expiration time

### **AWS Connection Issues:**
- Verify AWS credentials are correct
- Check that the IAM user has necessary permissions:
  - `ec2:DescribeInstances`
  - `ec2:DescribeVolumes`
  - `ec2:DescribeAddresses`
  - `cloudwatch:GetMetricData`
  - `pricing:GetProducts`

---

## 📝 Next Steps

1. ✅ Run database migration
2. ✅ Add environment variables
3. ✅ Start backend server
4. ✅ Start frontend server
5. ✅ Test registration flow
6. ✅ Test login flow
7. ✅ Test AWS connection
8. ✅ Test scan functionality

---

## 🎉 You're All Set!

The authentication system is fully implemented and ready to use. Users can now:
- Create accounts
- Login securely
- Connect their AWS accounts
- See their own resources
- Run scans on their AWS accounts

Enjoy your secure, multi-tenant SaaS Sentry Dashboard! 🚀








