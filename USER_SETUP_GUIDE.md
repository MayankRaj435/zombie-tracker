# 🚀 User Setup Guide - CloudGuard

Complete guide for setting up and running CloudGuard on your machine.

---

## ✅ Prerequisites & Requirements

### **1. Software Requirements**

#### **Node.js & npm**
- **Node.js:** Version 18.0.0 or higher
- **npm:** Comes with Node.js (version 9.0.0 or higher)
- **How to check:** Run `node --version` and `npm --version` in terminal
- **Download:** [nodejs.org](https://nodejs.org/)

#### **PostgreSQL Database**
- **PostgreSQL:** Version 14 or higher
- **Options:**
  - **Local Installation:** Install PostgreSQL on your machine
  - **Cloud Service (Recommended):** Use [Supabase](https://supabase.com) (free tier available)
- **Why needed:** Stores user accounts and scan results

#### **Git** (Optional)
- For cloning the repository
- **Download:** [git-scm.com](https://git-scm.com/)

---

### **2. AWS Account Requirements**

#### **AWS Account**
- Active AWS account with billing enabled
- Access to AWS Console

#### **IAM User with Permissions**
Create an IAM user with these permissions:

**Required IAM Permissions:**
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

**Or attach these managed policies:**
- `AmazonEC2ReadOnlyAccess`
- `CloudWatchReadOnlyAccess`
- `AWSPriceListServiceFullAccess`

#### **AWS Access Keys**
- Access Key ID
- Secret Access Key
- **How to create:** AWS Console → IAM → Users → Security Credentials → Create Access Key

---

## 📦 Installation Steps

### **Step 1: Clone or Download the Project**

```bash
# Option 1: Clone from Git
git clone <repository-url>
cd saas-sentry-project

# Option 2: Download ZIP and extract
```

---

### **Step 2: Set Up Database**

#### **Option A: Using Supabase (Recommended - Free)**

1. Go to [supabase.com](https://supabase.com)
2. Sign up for free account
3. Create a new project
4. Go to **Settings** → **Database**
5. Copy the **Connection String** (looks like: `postgresql://...`)

#### **Option B: Local PostgreSQL**

1. Install PostgreSQL on your machine
2. Create a new database:
   ```sql
   CREATE DATABASE cloudguard;
   ```
3. Connection string format:
   ```
   postgresql://username:password@localhost:5432/cloudguard
   ```

---

### **Step 3: Backend Setup**

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
# Copy the example below and fill in your values
```

**Create `backend/.env` file:**
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# JWT Secret (generate a random string, min 32 characters)
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"

# JWT Expiration
JWT_EXPIRES_IN="24h"

# Encryption Key (generate a random string, min 32 characters)
ENCRYPTION_KEY="your-encryption-key-minimum-32-characters-long"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"

# Server Port
PORT=3001

# Environment
NODE_ENV=development
```

**Generate secure keys:**
```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Use online generator
# Visit: https://randomkeygen.com/
```

**Run database migrations:**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) View database in Prisma Studio
npx prisma studio
```

**Start backend server:**
```bash
npm run dev
```

Backend should run on `http://localhost:3001`

---

### **Step 4: Frontend Setup**

```bash
# Navigate to frontend folder (in a new terminal)
cd frontend

# Install dependencies
npm install

# Create .env file (optional - defaults work for local dev)
```

**Create `frontend/.env` file (optional):**
```env
VITE_API_URL=http://localhost:3001
```

**Start frontend server:**
```bash
npm run dev
```

Frontend should run on `http://localhost:5173`

---

## 🔐 Security Checklist

### **Before Going to Production:**

- [ ] Change all default secrets (JWT_SECRET, ENCRYPTION_KEY)
- [ ] Use strong, randomly generated keys (32+ characters)
- [ ] Never commit `.env` files to Git
- [ ] Use HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Enable database backups
- [ ] Use environment-specific configurations
- [ ] Review AWS IAM permissions (principle of least privilege)

---

## ⚙️ Configuration Details

### **Environment Variables Explained:**

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for signing JWT tokens | Random 32+ char string |
| `JWT_EXPIRES_IN` | Token expiration time | `24h`, `7d` |
| `ENCRYPTION_KEY` | Key for encrypting AWS credentials | Random 32+ char string |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |
| `PORT` | Backend server port | `3001` |

---

## 🧪 Testing the Setup

### **1. Check Backend Health**
```bash
# In browser or terminal
curl http://localhost:3001/health
# Should return: {"status":"ok"}
```

### **2. Check Frontend**
- Open `http://localhost:5173`
- Should see login page

### **3. Create Account**
- Click "Create Account"
- Fill in email, password, name
- Should redirect to dashboard

### **4. Connect AWS**
- Click "Connect AWS Account"
- Enter:
  - AWS Access Key ID
  - AWS Secret Access Key
  - AWS Region (e.g., `us-east-1`)
- Click "Connect"

### **5. Run First Scan**
- Click "Run Scan" button
- Wait for scan to complete
- View results in dashboard

---

## 🐛 Common Issues & Solutions

### **Issue 1: Database Connection Failed**
**Error:** `Can't reach database server`

**Solutions:**
- Check PostgreSQL is running
- Verify DATABASE_URL is correct
- Check firewall settings
- Ensure database exists

---

### **Issue 2: Port Already in Use**
**Error:** `Port 3001 is already in use`

**Solutions:**
- Change PORT in `.env` file
- Kill process using port:
  ```bash
  # Windows
  netstat -ano | findstr :3001
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -ti:3001 | xargs kill
  ```

---

### **Issue 3: AWS Credentials Invalid**
**Error:** `InvalidClientTokenId` or `SignatureDoesNotMatch`

**Solutions:**
- Verify Access Key ID is correct
- Verify Secret Access Key is correct
- Check IAM permissions are set correctly
- Ensure AWS account is active

---

### **Issue 4: CORS Error**
**Error:** `CORS policy blocked`

**Solutions:**
- Check FRONTEND_URL in backend `.env`
- Ensure frontend URL matches exactly
- Restart backend server after changing `.env`

---

### **Issue 5: Prisma Client Not Generated**
**Error:** `PrismaClient is not defined`

**Solutions:**
```bash
cd backend
npx prisma generate
```

---

### **Issue 6: No Data Showing**
**Possible Causes:**
- No scan has been run yet
- AWS region is incorrect
- IAM permissions missing
- Instances are not idle (CPU > 5%)

**Solutions:**
- Run a scan first
- Verify AWS region matches your resources
- Check IAM permissions
- Verify instances are actually idle

---

## 📋 Quick Setup Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL database set up (local or Supabase)
- [ ] Backend dependencies installed (`npm install`)
- [ ] Backend `.env` file created with all variables
- [ ] Database migrations run (`npx prisma migrate deploy`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend `.env` file created (optional)
- [ ] Backend server running (`npm run dev`)
- [ ] Frontend server running (`npm run dev`)
- [ ] AWS account with IAM user created
- [ ] AWS Access Keys generated
- [ ] Account created in app
- [ ] AWS account connected
- [ ] First scan completed successfully

---

## 🔄 Daily Usage

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Dashboard:**
   - Open `http://localhost:5173`
   - Login with your credentials
   - View or run scans

---

## 📚 Additional Resources

- [Tech Stack Documentation](./TECH_STACK.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## ⚠️ Important Notes

1. **Never share your `.env` files** - They contain sensitive credentials
2. **Keep AWS keys secure** - Rotate them regularly
3. **Use strong passwords** - Minimum 8 characters
4. **Backup your database** - Especially in production
5. **Monitor AWS costs** - The app helps identify waste, but monitor your usage

---

## 🆘 Need Help?

If you encounter issues:
1. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Review error messages in browser console (F12)
3. Check backend terminal for error logs
4. Verify all environment variables are set correctly
5. Ensure all prerequisites are installed

---

**Last Updated:** 2024
**Project:** CloudGuard - AWS Cloud Waste Monitoring Dashboard

