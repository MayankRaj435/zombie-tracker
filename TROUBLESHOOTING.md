# 🔧 Troubleshooting Guide

## Common Errors and Solutions

### **Error: "JWT_SECRET is not defined" or "ENCRYPTION_KEY is not defined"**

**Solution:**
- Make sure you've added these to `backend/.env`:
  ```env
  JWT_SECRET="your-secret-key-here"
  ENCRYPTION_KEY="your-encryption-key-here"
  ```
- Restart the backend server after adding them

---

### **Error: "Cannot connect to database" or Prisma errors**

**Solution:**
- Check that `DATABASE_URL` is correct in `backend/.env`
- Make sure your database is accessible
- Run: `cd backend && npx prisma generate`

---

### **Error: "Cannot find module" or import errors**

**Solution:**
- Make sure all dependencies are installed:
  ```bash
  cd backend && npm install
  cd frontend && npm install
  ```

---

### **Error: "Network error" or "Failed to fetch" in frontend**

**Solution:**
- Make sure backend is running on port 3001
- Check that `API_URL` in `frontend/src/context/AuthContext.tsx` is `http://localhost:3001`
- Check CORS settings in backend (should be enabled)

---

### **Error: "401 Unauthorized" or "Token invalid"**

**Solution:**
- Clear localStorage in browser: `localStorage.clear()`
- Make sure `JWT_SECRET` is set in backend `.env`
- Try logging in again

---

### **Error: "AWS credentials not found" when running scan**

**Solution:**
- Make sure you've connected your AWS account first
- Go to dashboard and click "Connect AWS Account"
- Enter valid AWS credentials

---

### **Error: "Port already in use"**

**Solution:**
- Backend: Change `PORT` in `backend/.env` or kill the process using port 3001
- Frontend: Vite will automatically use another port

---

## How to Share Error Details

When reporting an error, please include:

1. **The exact error message** (copy/paste)
2. **Where it appears:**
   - Backend terminal?
   - Frontend terminal?
   - Browser console? (F12 → Console tab)
   - Browser screen?
3. **What you were doing:**
   - Starting backend?
   - Starting frontend?
   - Registering?
   - Logging in?
   - Running scan?
4. **Screenshots** (if possible)

---

## Quick Checks

Before reporting an error, verify:

✅ Backend `.env` has:
- `DATABASE_URL`
- `JWT_SECRET`
- `ENCRYPTION_KEY`
- `JWT_EXPIRES_IN` (optional, defaults to "24h")

✅ Backend server is running:
```bash
cd backend
npm run dev
```

✅ Frontend server is running:
```bash
cd frontend
npm run dev
```

✅ All dependencies installed:
```bash
cd backend && npm install
cd frontend && npm install
```

---

## Still Having Issues?

Share the error message and I'll help you fix it! 🚀








