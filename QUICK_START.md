# 🚀 Quick Start Guide - Authentication System

## ✅ Database Migration - DONE!
The database migration has been completed successfully. Your database is ready!

---

## 📝 Step-by-Step Setup

### **Step 1: Add Environment Variables**

Open `backend/.env` and add these three new variables:

```env
# Add these new variables to your existing .env file:

JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"
ENCRYPTION_KEY="your-encryption-key-for-aws-credentials-change-this"
```

**How to generate secure keys:**
- You can use any random string generator
- Or run this in Node.js: `require('crypto').randomBytes(32).toString('hex')`
- Make them long and random (at least 32 characters)

**Example:**
```env
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
JWT_EXPIRES_IN="24h"
ENCRYPTION_KEY="z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4"
```

---

### **Step 2: Start Backend Server**

Open a terminal and run:

```bash
cd backend
npm run dev
```

You should see:
```
Server is running on http://localhost:3001
Authentication enabled. Users must login to access the dashboard.
```

---

### **Step 3: Start Frontend Server**

Open a **new terminal** and run:

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v... ready in ... ms
➜  Local:   http://localhost:5173/
```

---

### **Step 4: Test the Application**

1. **Open your browser** and go to: `http://localhost:5173` (or the port shown)

2. **You'll be redirected to `/login`** (since you're not authenticated)

3. **Create an account:**
   - Click "Create Account" or go to `/signup`
   - Fill in:
     - Email (e.g., `test@example.com`)
     - Password (min 8 characters)
     - Name (optional)
   - Click "Create Account"
   - You'll be automatically logged in and redirected to dashboard

4. **Connect AWS Account:**
   - On the dashboard, you'll see "Connect AWS Account" form
   - Enter your AWS credentials:
     - AWS Access Key ID
     - AWS Secret Access Key
     - AWS Region (select from dropdown)
   - Click "Connect AWS Account"
   - Your credentials will be encrypted and stored

5. **Run a Scan:**
   - Click "Run New Scan" button
   - Wait for the scan to complete
   - View your resources on the dashboard

6. **View Results:**
   - See your idle instances, orphaned volumes, and unattached EIPs
   - View potential cost savings
   - All data is user-specific!

---

## 🎯 What You Can Do Now

✅ **User Registration & Login**
- Create multiple user accounts
- Each user has their own login credentials
- Secure password hashing

✅ **AWS Account Management**
- Each user connects their own AWS account
- Credentials are encrypted before storage
- Users can disconnect and reconnect anytime

✅ **User-Specific Scans**
- Each user sees only their own AWS resources
- Scans use the user's AWS credentials
- No data mixing between users

✅ **Protected Dashboard**
- Only authenticated users can access
- Auto-redirect to login if not authenticated
- Token-based authentication

---

## 🔍 Troubleshooting

### **Backend won't start:**
- Check that all environment variables are set in `backend/.env`
- Make sure `DATABASE_URL` is correct
- Verify `JWT_SECRET` and `ENCRYPTION_KEY` are set

### **Frontend shows errors:**
- Make sure backend is running on port 3001
- Check browser console for errors
- Verify API URL in `frontend/src/context/AuthContext.tsx` (should be `http://localhost:3001`)

### **Can't connect AWS:**
- Verify your AWS credentials are correct
- Check that your AWS IAM user has these permissions:
  - `ec2:DescribeInstances`
  - `ec2:DescribeVolumes`
  - `ec2:DescribeAddresses`
  - `cloudwatch:GetMetricData`
  - `pricing:GetProducts`

### **Database errors:**
- Make sure database is accessible
- Check `DATABASE_URL` in `backend/.env`
- Run `npx prisma generate` if Prisma Client is outdated

---

## 📚 Next Steps

1. ✅ Add environment variables
2. ✅ Start backend server
3. ✅ Start frontend server
4. ✅ Create your first account
5. ✅ Connect your AWS account
6. ✅ Run your first scan
7. ✅ Explore the dashboard!

---

## 🎉 You're All Set!

Your authentication system is ready to use. Each user can now:
- Create their own account
- Connect their AWS account securely
- Monitor their own resources
- See their potential cost savings

Enjoy your secure, multi-tenant SaaS Sentry Dashboard! 🚀








