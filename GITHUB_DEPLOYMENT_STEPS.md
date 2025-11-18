# 🚀 Complete Deployment Guide - GitHub to Vercel

## Step-by-Step Instructions

### **Step 1: Prepare Code for GitHub**

1. **Create `.gitignore` files** (already created ✅)

2. **Initialize Git Repository**
   ```bash
   # In project root (d:\saas-sentry-project)
   git init
   git add .
   git commit -m "Initial commit: SaaS Sentry Dashboard with authentication"
   ```

3. **Create GitHub Repository**
   - Go to [github.com](https://github.com)
   - Click "New Repository"
   - Name: `cloudguard-dashboard`
   - Description: "AWS cloud waste monitoring dashboard"
   - Public or Private (your choice)
   - **Don't** initialize with README
   - Click "Create repository"

4. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/cloudguard-dashboard.git
   git branch -M main
   git push -u origin main
   ```

---

### **Step 2: Deploy Backend to Railway**

1. **Sign up for Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `cloudguard-dashboard` repository

3. **Configure Service**
   - Railway will detect it's a Node.js project
   - **Root Directory**: Set to `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`

4. **Add Environment Variables**
   Click on your service → Variables tab → Add:
   ```
   DATABASE_URL=your-supabase-connection-string
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   JWT_EXPIRES_IN=24h
   ENCRYPTION_KEY=your-encryption-key-min-32-chars
   FRONTEND_URL=https://your-frontend.vercel.app (we'll update this after frontend deploy)
   PORT=3001
   NODE_ENV=production
   ```

5. **Deploy**
   - Railway will automatically deploy
   - Wait for deployment to complete
   - **Copy your backend URL** (e.g., `https://your-app.railway.app`)

6. **Run Database Migration**
   - Go to your service → Deployments → Click on deployment
   - Open "Shell" tab
   - Run: `cd backend && npx prisma migrate deploy`

---

### **Step 3: Deploy Frontend to Vercel**

1. **Sign up for Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import from GitHub
   - Select your `cloudguard-dashboard` repository

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   Click "Environment Variables" → Add:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
   (Use the Railway URL from Step 2)

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment
   - **Copy your frontend URL** (e.g., `https://your-app.vercel.app`)

6. **Update Backend CORS**
   - Go back to Railway
   - Update `FRONTEND_URL` variable to your Vercel URL
   - Railway will automatically redeploy

---

### **Step 4: Test Deployment**

1. **Visit your Vercel URL**
2. **Test Registration**
   - Create a new account
   - Should work!

3. **Test AWS Connection**
   - Connect AWS account
   - Run a scan
   - Check results

---

## 🔧 Alternative: Render (Instead of Railway)

If you prefer Render:

1. **Sign up**: [render.com](https://render.com)
2. **New Web Service**: Connect GitHub
3. **Configure**:
   - Name: `cloudguard-backend`
   - Environment: Node
   - Build Command: `cd backend && npm install && npx prisma generate`
   - Start Command: `cd backend && npm start`
4. **Environment Variables**: Same as Railway
5. **Get URL**: `https://your-app.onrender.com`

---

## 📝 Environment Variables Checklist

### **Backend (Railway/Render):**
- [ ] `DATABASE_URL`
- [ ] `JWT_SECRET`
- [ ] `JWT_EXPIRES_IN`
- [ ] `ENCRYPTION_KEY`
- [ ] `FRONTEND_URL` (update after frontend deploy)
- [ ] `PORT`
- [ ] `NODE_ENV=production`

### **Frontend (Vercel):**
- [ ] `VITE_API_URL` (your backend URL)

---

## 🎉 You're Live!

Your app is now accessible to anyone with the Vercel URL!

**Next Steps:**
- Share your Vercel URL with users
- Set up custom domain (optional)
- Monitor usage and errors
- Scale as needed

