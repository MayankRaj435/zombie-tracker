# CloudGuard Deployment Guide

This guide will help you deploy CloudGuard to production so others can access it over the internet.

## Architecture Overview

CloudGuard consists of two parts:
- **Frontend** (React + Vite) - Can be deployed to Vercel, Netlify, or similar
- **Backend** (Node.js + Express + Prisma) - Can be deployed to Render, Railway, or similar
- **Database** (PostgreSQL) - Provided by your backend hosting platform

## Prerequisites

Before deploying, you'll need:
1. GitHub account (to push your code)
2. Vercel account (for frontend) - Free tier available
3. Render/Railway account (for backend + database) - Free tier available

---

## Step 1: Prepare Your Code for Deployment

### 1.1 Create a `.gitignore` file in the root

```
node_modules/
.env
.env.local
dist/
build/
*.log
.DS_Store
```

### 1.2 Update Backend Environment Variables

Create a `.env.example` file in the `backend` folder:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
ENCRYPTION_KEY="your-32-character-encryption-key"
JWT_SECRET="your-jwt-secret-key"
PORT=3001
NODE_ENV=production
```

### 1.3 Update Frontend Environment Variables

Create a `.env.example` file in the `frontend` folder:

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## Step 2: Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - CloudGuard deployment ready"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/cloudguard.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend (Render - Recommended)

### Why Render?
- Free PostgreSQL database included
- Easy deployment from GitHub
- Automatic HTTPS
- Good free tier

### Steps:

1. **Go to [Render.com](https://render.com)** and sign up

2. **Create a PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Name: `cloudguard-db`
   - Region: Choose closest to your users
   - Plan: Free
   - Click "Create Database"
   - **Copy the "Internal Database URL"** - you'll need this!

3. **Create a Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `cloudguard-backend`
     - **Region**: Same as database
     - **Branch**: `main`
     - **Root Directory**: `backend`
     - **Runtime**: Node
     - **Build Command**: `npm install && npx prisma generate && npx prisma db push`
     - **Start Command**: `npm start`
     - **Plan**: Free

4. **Add Environment Variables** (in Render dashboard):
   ```
   DATABASE_URL = [Paste the Internal Database URL from step 2]
   ENCRYPTION_KEY = [Generate a random 32-character string]
   JWT_SECRET = [Generate a random string]
   NODE_ENV = production
   PORT = 3001
   ```

5. **Update `package.json` in backend** to add start script:
   ```json
   "scripts": {
     "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
     "build": "tsc",
     "start": "node dist/index.js"
   }
   ```

6. Click "Create Web Service" and wait for deployment

7. **Copy your backend URL** (e.g., `https://cloudguard-backend.onrender.com`)

---

## Step 4: Deploy Frontend (Vercel - Recommended)

### Why Vercel?
- Built for React/Vite apps
- Automatic deployments from GitHub
- Free tier with custom domains
- CDN included

### Steps:

1. **Go to [Vercel.com](https://vercel.com)** and sign up

2. **Import Your Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variables**:
   ```
   VITE_API_URL = https://cloudguard-backend.onrender.com
   ```
   (Use the backend URL from Step 3)

5. Click "Deploy" and wait for deployment

6. **Your app is live!** Vercel will give you a URL like `https://cloudguard.vercel.app`

---

## Step 5: Configure CORS (Important!)

Update your backend `src/index.ts` to allow requests from your Vercel frontend:

```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'https://cloudguard.vercel.app', // Add your Vercel URL
  'https://your-custom-domain.com' // If you have a custom domain
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

Push this change to GitHub, and Render will automatically redeploy.

---

## Step 6: Test Your Deployment

1. Visit your Vercel URL
2. Sign up for a new account
3. Connect AWS credentials
4. Run a scan
5. Test all features

---

## Alternative Deployment Options

### Backend Alternatives:

#### **Railway** (Similar to Render)
- Go to [Railway.app](https://railway.app)
- Create a new project from GitHub
- Add PostgreSQL database
- Configure environment variables
- Very similar process to Render

#### **Heroku** (Paid, but reliable)
- Requires credit card even for free tier
- More expensive but very stable
- Good documentation

### Frontend Alternatives:

#### **Netlify**
- Very similar to Vercel
- Great free tier
- Go to [Netlify.com](https://netlify.com)

#### **GitHub Pages** (Static only)
- Free but limited
- No environment variables support
- Not recommended for this project

---

## Cost Breakdown

### Free Tier (Recommended for Testing)
- **Render**: Free (with limitations: sleeps after 15 min inactivity)
- **Vercel**: Free (100GB bandwidth/month)
- **Total**: $0/month

### Production Tier (For Real Users)
- **Render**: $7/month (always on + 256MB RAM)
- **Vercel**: Free tier is usually sufficient
- **Total**: ~$7/month

### Scale Tier (Many Users)
- **Render**: $25/month (1GB RAM)
- **Vercel**: $20/month (Pro plan)
- **Total**: ~$45/month

---

## Important Notes

### ⚠️ Security Considerations

1. **Never commit `.env` files** to GitHub
2. **Use strong encryption keys** (32+ characters, random)
3. **Enable HTTPS** (automatic on Render/Vercel)
4. **Rotate secrets regularly** in production

### 🔄 Automatic Deployments

Both Render and Vercel support automatic deployments:
- Push to `main` branch → Automatic deployment
- Create a `dev` branch for testing
- Use Pull Requests for code review

### 📊 Monitoring

**Render Dashboard**:
- View logs
- Monitor CPU/Memory usage
- Check database connections

**Vercel Dashboard**:
- View deployment logs
- Monitor bandwidth usage
- Check build times

---

## Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify DATABASE_URL is correct
- Ensure Prisma migrations ran successfully

### Frontend can't connect to backend
- Verify VITE_API_URL is correct
- Check CORS configuration
- Ensure backend is running (not sleeping)

### Database connection errors
- Check DATABASE_URL format
- Verify database is running
- Check connection limits

### Render free tier sleeping
- First request takes 30-60 seconds (cold start)
- Consider upgrading to paid tier for production
- Or use Railway which has better free tier

---

## Custom Domain (Optional)

### For Frontend (Vercel):
1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### For Backend (Render):
1. Upgrade to paid plan
2. Go to service settings
3. Add custom domain
4. Update DNS records

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Vercel
3. ✅ Test all functionality
4. 📝 Share the URL with users
5. 📊 Monitor usage and performance
6. 🔄 Set up CI/CD for automatic deployments

---

## Support

If you encounter issues:
- Check Render/Vercel documentation
- Review deployment logs
- Verify environment variables
- Test locally first with production settings

Good luck with your deployment! 🚀
