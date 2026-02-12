# Deployment (Free-friendly)

This repo is a monorepo:

- `frontend/` (Vite static site) → deploy on **Vercel (free)**
- `backend/` (Express + Prisma) → deploy on a **Node host** (Render/Koyeb/etc.)
- PostgreSQL → **Supabase** / **Neon** / host-provided DB (free tiers exist)

> Note: Vercel is great for the frontend, but this backend is a long-running Express server (not a Vercel Serverless/Edge function setup).

## 0) Security first (do this before deploying)

- Ensure `.env` files are **not committed** (they’re already ignored).
- If secrets were ever committed, **rotate**:
  - AWS access keys
  - database password / connection string
  - `JWT_SECRET` and `ENCRYPTION_KEY`

## 1) Deploy the frontend to Vercel (free)

This repo includes a root `vercel.json` that builds the Vite app from `frontend/`.

### Steps

1. Push your code to GitHub.
2. In Vercel: **Add New → Project → Import** your repo.
3. Set environment variables (Project → Settings → Environment Variables):
   - `VITE_API_URL` = `https://YOUR_BACKEND_DOMAIN`
4. Deploy.

Vercel’s free (Hobby) tier is usually enough for demos/personal projects. (As of 2026, it includes ~100GB fast data transfer/month and generous build minutes; check Vercel’s plan page for current limits.)

## 2) Deploy the backend (free options)

You can deploy `backend/` to a service that supports Node + long-running servers.

### Option A: Render (free, but sleeps)

- Create a new **Web Service**
- Root directory: `backend`
- Build command:

```bash
npm ci && npx prisma generate && npx prisma db push && npm run build
```

- Start command:

```bash
npm start
```

Set environment variables:

- `DATABASE_URL` (Postgres connection string)
- `JWT_SECRET` (long random string)
- `ENCRYPTION_KEY` (long random string)
- `NODE_ENV=production`
- `FRONTEND_URL=https://YOUR_VERCEL_DOMAIN`

Render free services commonly **sleep after inactivity** → first request can be slow (cold start).

### Option B: Koyeb (scale-to-zero free tier)

Koyeb can run a Node web service and scale to zero on inactivity (behavior/limits depend on their current free plan).

Deploy settings are similar to Render:
- Root: `backend`
- Build: `npm ci && npx prisma generate && npx prisma db push && npm run build`
- Start: `npm start`
- Same env vars as above

### Database (free)

Common free Postgres choices:
- Supabase (Postgres)
- Neon (Postgres)

Copy the provider’s connection string into `DATABASE_URL`.

## 3) CORS / env checklist

Backend must have:
- `FRONTEND_URL` set to your Vercel URL (locks down CORS in production)

Frontend must have:
- `VITE_API_URL` set to your backend URL

## 4) Verify in production

- Visit the Vercel URL
- Register/login
- Connect AWS credentials
- Run a scan

If the frontend can’t reach the backend:
- Confirm `VITE_API_URL`
- Confirm backend logs show it started successfully
- Confirm `FRONTEND_URL` matches your Vercel origin exactly (scheme + domain)

