# 🚀 Deployment Guide - SaaS Sentry Dashboard

## Overview

This guide covers:
1. **Frontend**: Deploy to Vercel
2. **Backend**: Deploy to Railway/Render/Fly.io (Vercel doesn't support long-running Node.js)
3. **Database**: Already using Supabase (PostgreSQL)
4. **GitHub**: Upload code to repository

---

## 📦 Step 1: Prepare for Deployment

### **1.1 Create `.gitignore` files**

Make sure these files exist and are properly configured:

**`.gitignore` (root):**
```
node_modules/
.env
.env.local
.env.production
.DS_Store
dist/
build/
*.log
.vscode/
.idea/
```

**`backend/.gitignore`:**
```
node_modules/
.env
dist/
*.log
```

**`frontend/.gitignore`:**
```
node_modules/
.env
dist/
build/
.vite/
```

### **1.2 Update API URLs for Production**

We need to make the API URL configurable:

**Frontend:** Update `frontend/src/context/AuthContext.tsx`:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

**Frontend:** Update `frontend/src/components/Dashboard.tsx`:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

**Frontend:** Update `frontend/src/components/auth/ConnectAWS.tsx`:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

---

## 🐙 Step 2: Upload to GitHub

### **2.1 Initialize Git Repository**

```bash
# In project root
git init
git add .
git commit -m "Initial commit: SaaS Sentry Dashboard with authentication"
```

### **2.2 Create GitHub Repository**

1. Go to GitHub.com
2. Click "New Repository"
3. Name it: `cloudguard-dashboard`
4. Don't initialize with README (we already have files)
5. Click "Create repository"

### **2.3 Push to GitHub**

```bash
git remote add origin https://github.com/YOUR_USERNAME/cloudguard-dashboard.git
git branch -M main
git push -u origin main
```

---

## ☁️ Step 3: Deploy Backend (Railway/Render)

### **Option A: Railway (Recommended)**

1. **Sign up**: Go to [railway.app](https://railway.app)
2. **New Project**: Click "New Project"
3. **Deploy from GitHub**: Select your repository
4. **Configure**:
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm run dev` (or `npm start` for production)
5. **Environment Variables**: Add these in Railway dashboard:
   ```
   DATABASE_URL=your-supabase-connection-string
   JWT_SECRET=your-jwt-secret
   JWT_EXPIRES_IN=24h
   ENCRYPTION_KEY=your-encryption-key
   PORT=3001
   NODE_ENV=production
   ```
6. **Get Backend URL**: Railway will give you a URL like `https://your-app.railway.app`

### **Option B: Render**

1. **Sign up**: Go to [render.com](https://render.com)
2. **New Web Service**: Connect GitHub repo
3. **Configure**:
   - Name: `cloudguard-backend`
   - Environment: Node
   - Build Command: `cd backend && npm install && npx prisma generate`
   - Start Command: `cd backend && npm start`
4. **Environment Variables**: Same as Railway
5. **Get Backend URL**: Render gives you `https://your-app.onrender.com`

---

## 🎨 Step 4: Deploy Frontend to Vercel

### **4.1 Prepare Frontend**

1. **Create `vercel.json`** in `frontend/`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite"
}
```

2. **Update `vite.config.ts`** to handle routing:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})
```

### **4.2 Deploy to Vercel**

1. **Sign up**: Go to [vercel.com](https://vercel.com)
2. **Import Project**: Click "Add New" → "Project"
3. **Import from GitHub**: Select your repository
4. **Configure**:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment Variables**: Add:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
   (Use your actual backend URL from Railway/Render)
6. **Deploy**: Click "Deploy"

---

## 🔧 Step 5: Update CORS Settings

### **Backend CORS Configuration**

Update `backend/src/index.ts`:

```typescript
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

Add to backend environment variables:
```
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 🗄️ Step 6: Database Migration

### **Run Migrations on Production**

In Railway/Render, you can run:

```bash
# Via Railway CLI or Render Shell
cd backend
npx prisma migrate deploy
```

Or add to your deployment script:
```json
// package.json
{
  "scripts": {
    "postinstall": "npx prisma generate",
    "deploy": "npx prisma migrate deploy && npm start"
  }
}
```

---

## ✅ Step 7: Verify Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend**: Test `https://your-backend-url/health`
3. **Test Flow**:
   - Register account
   - Login
   - Connect AWS
   - Run scan

---

## 🔐 Environment Variables Summary

### **Backend (Railway/Render):**
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
ENCRYPTION_KEY=your-encryption-key
FRONTEND_URL=https://your-frontend.vercel.app
PORT=3001
NODE_ENV=production
```

### **Frontend (Vercel):**
```
VITE_API_URL=https://your-backend-url.railway.app
```

---

## 🐛 Troubleshooting

### **CORS Errors:**
- Make sure `FRONTEND_URL` in backend matches your Vercel URL
- Check CORS configuration in backend

### **Database Connection:**
- Verify `DATABASE_URL` is correct
- Check Supabase connection settings
- Ensure database is accessible from Railway/Render

### **Build Errors:**
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs in deployment platform

---

## 📝 Production Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed to Railway/Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set
- [ ] CORS configured
- [ ] Database migrations run
- [ ] Health endpoint working
- [ ] Test registration/login
- [ ] Test AWS connection
- [ ] Test scan functionality

---

## 🚀 Next Steps

After deployment:
1. Set up custom domain (optional)
2. Enable HTTPS (automatic on Vercel/Railway)
3. Set up monitoring/logging
4. Configure backups for database

