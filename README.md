# SaasSentry (CloudGuard)

SaasSentry is a full‑stack app that lets users connect an AWS account, scan for idle/wasteful resources, and view cost + security insights.

## Tech stack

- **Frontend**: React + TypeScript + Vite (static build)
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL

## Local development

### Backend

```bash
cd backend
npm install
copy .env.example .env  # Windows. Use cp on Mac/Linux.
# Fill in DATABASE_URL / JWT_SECRET / ENCRYPTION_KEY / FRONTEND_URL
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
# Set VITE_API_URL=http://localhost:3001
npm run dev
```

## Deployment

See `DEPLOYMENT.md` for the step‑by‑step guide (Vercel frontend + separate backend hosting).

## Security notes (important)

- **Never commit `.env` files**.
- If secrets were ever committed, **rotate them immediately** (AWS keys, DB password, JWT/encryption keys).
- Frontend requires `VITE_API_URL` and will **throw on startup** if it’s missing (prevents accidental “production → localhost”).

