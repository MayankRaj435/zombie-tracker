# ⚡ Quick Deployment Guide

## 🚀 Deploy in 3 Steps

### **Step 1: Push to GitHub** (5 minutes)

```bash
# In your project root
git init
git add .
git commit -m "CloudGuard Dashboard - Ready for deployment"

# Create repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/cloudguard-dashboard.git
git branch -M main
git push -u origin main
```

---

### **Step 2: Deploy Backend to Railway** (10 minutes)

1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. New Project → Deploy from GitHub → Select your repo
3. Settings → Root Directory: `backend`
4. Variables → Add:
   ```
   DATABASE_URL=your-supabase-url
   JWT_SECRET=random-32-char-string
   ENCRYPTION_KEY=random-32-char-string
   JWT_EXPIRES_IN=24h
   FRONTEND_URL=https://your-app.vercel.app (update after step 3)
   NODE_ENV=production
   ```
5. Deployments → Shell → Run: `npx prisma migrate deploy`
6. **Copy your Railway URL** (e.g., `https://your-app.railway.app`)

---

### **Step 3: Deploy Frontend to Vercel** (5 minutes)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Add New → Project → Import from GitHub → Select repo
3. Configure:
   - Root Directory: `frontend`
   - Framework: Vite
4. Environment Variables → Add:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
5. Deploy → **Copy your Vercel URL**
6. Go back to Railway → Update `FRONTEND_URL` → Redeploy

---

## ✅ Done!

Your app is live at: `https://your-app.vercel.app`

---

## 🔍 Why Instances Don't Show - FIXED!

### **The Issue:**
- Scanner only shows **idle instances** (CPU < 5%)
- CloudWatch data might not be available for new instances
- Errors were being hidden

### **The Fix:**
✅ Now shows instances without CloudWatch data (new instances)
✅ Better error messages
✅ Background processing
✅ Success feedback

### **What Gets Shown:**
- ✅ Idle instances (CPU < 5%)
- ✅ New instances (no CloudWatch data yet)
- ✅ Orphaned volumes
- ✅ Unattached IPs

### **What Doesn't Show:**
- ❌ Active instances (CPU > 5%) - This is correct!

---

## 📚 Full Guides

- [Complete Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [GitHub Deployment Steps](./GITHUB_DEPLOYMENT_STEPS.md)
- [AWS Troubleshooting](./AWS_TROUBLESHOOTING.md)
- [Scalability Improvements](./SCALABILITY_IMPROVEMENTS.md)

