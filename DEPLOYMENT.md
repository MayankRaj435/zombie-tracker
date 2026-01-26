# 🚀 CloudGuard Deployment Guide

This guide describes how to deploy the CloudGuard application for production use. We will use **Vercel** for the high-performance React frontend and **Railway** for the backend server and database.

## System Architecture for Production

- **Frontend**: Hosted on Vercel (Edge Network, CDN).
- **Backend**: Hosted on Railway (Node.js Container).
- **Database**: PostgreSQL on Railway (or your existing Supabase instance).

---

## 1. Backend Deployment (Railway)

We deploy the backend first to get the API URL.

1.  **Create a Railway Account**: Go to [railway.app](https://railway.app/) and sign up.
2.  **New Project**: Click "New Project" -> "Deploy from GitHub repo" -> Select your `saas-sentry-project`.
3.  **Configure Root Directory**:
    - Railway might try to deploy the root. We need it to deploy the `backend` folder.
    - Go to Settings -> General -> Root Directory.
    - Set it to `/backend`.
4.  **Set Environment Variables**:
    - Go to the "Variables" tab.
    - Add the following variables (copy values from your local `.env`):
        - `DATABASE_URL`: `postgresql://...` (Use your Supabase URL or create a new Postgres service in Railway and link it).
        - `JWT_SECRET`: Generate a strong random string (e.g., `openssl rand -hex 32`).
        - `ENCRYPTION_KEY`: A 32-byte hex string for encrypting AWS keys.
        - `PORT`: `3001` (or let Railway assign one, usually it uses `PORT` env var).
5.  **Build & Deploy**:
    - Railway should automatically detect the `package.json` in `/backend` and build it.
    - Once deployed, you will get a Public URL (e.g., `https://cloudguard-backend.up.railway.app`). **Copy this URL.**

### ⚠️ Important Note on Database
If you use the existing Supabase URL, ensure:
- It is reachable from the public internet (or whitelisted for Railway IPs).
- **Connection Pooling**: For "huge traffic", use the Transaction Mode connection pooler (port 6543 usually for Supabase) instead of the Session Mode (port 5432).

---

## 2. Frontend Deployment (Vercel)

1.  **Create a Vercel Account**: Go to [vercel.com](https://vercel.com/) and sign up.
2.  **Add New Project**: "Add New..." -> "Project" -> Import your `saas-sentry-project` repository.
3.  **Configure Project**:
    - **Framework Preset**: Vite.
    - **Root Directory**: Click "Edit" and select `frontend`.
4.  **Environment Variables**:
    - Expand "Environment Variables".
    - Add `VITE_API_URL`.
    - **Value**: The Railway Backend URL you copied earlier (e.g., `https://cloudguard-backend.up.railway.app`). **Do not add a trailing slash.**
5.  **Deploy**: Click "Deploy".
6.  Vercel will build your React app and deploy it to a global CDN. You will get a text-book URL like `https://cloudguard-frontend.vercel.app`.

---

## 3. Scaling for High Traffic

To handle "huge traffic", consider the following optimizations:

### Database (The Bottleneck)
- **Connection Pooling**: Essential. Ensure you are using PgBouncer (Supabase provides this by default).
- **Indexing**: Ensure `userId` and other frequently queried fields are indexed (already done in your Prisma schema).
- **Read Replicas**: If traffic grows very large, use read replicas for `GET` requests (statistics).

### Backend
- **Vertical Scaling**: Increase CPU/RAM in Railway settings if processing many scans.
- **Horizontal Scaling**: Run multiple instances of the backend service.
    - *Note*: Your `node-cron` jobs will run on *every* instance, causing duplicate scans.
    - **Fix for Scale**: Move the scanning logic to a separate "Worker" service or use a dedicated scheduler (like Railway Cron or Temporal) so the API servers remain stateless and scalable.

### Frontend
- Vercel handles scaling automatically via its Edge Network. No action needed.

---

## 4. Security Checklist
- [ ] **Rotate Keys**: Ensure the `JWT_SECRET` and `ENCRYPTION_KEY` in production are different from development.
- [ ] **Disable Console Logs**: Remove sensitive `console.log` statements in production builds.
- [ ] **CORS**: Update `app.use(cors())` in `backend/src/index.ts` to only allow your Vercel frontend domain:
    ```typescript
    app.use(cors({
      origin: 'https://your-frontend-domain.vercel.app'
    }));
    ```
