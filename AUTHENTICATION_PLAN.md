# Authentication System - Implementation Plan

## 📋 Overview
This document outlines the complete authentication flow and structure for the SaaS Sentry Dashboard project.

---

## 🔄 User Flow

### **First-Time User (New Account)**
```
1. User visits app → Redirected to Login Page
2. User clicks "Create Account" or "Sign Up" link
3. User fills registration form:
   - Email (required, unique)
   - Password (required, min 8 chars)
   - Confirm Password
   - Name (optional)
4. Backend validates & creates account
5. User automatically logged in
6. Redirected to Dashboard
```

### **Returning User (Existing Account)**
```
1. User visits app → Redirected to Login Page
2. User enters:
   - Email
   - Password
3. Backend validates credentials
4. If valid → User logged in → Redirected to Dashboard
5. If invalid → Show error message
```

### **Protected Routes**
```
- Dashboard: Requires authentication
- All API calls: Require authentication token
- If not authenticated → Redirect to Login
```

---

## 🏗️ Architecture Structure

### **Frontend Structure**
```
frontend/src/
├── components/
│   ├── auth/
│   │   ├── Login.tsx          # Login form component
│   │   ├── SignUp.tsx          # Registration form component
│   │   └── AuthLayout.tsx     # Auth page layout wrapper
│   └── common/
│       └── ProtectedRoute.tsx # Route protection wrapper
├── context/
│   └── AuthContext.tsx         # Global auth state management
├── services/
│   └── authService.ts         # API calls for auth
├── App.tsx                     # Main app with routing
└── Dashboard.tsx               # Current dashboard (moved from App.tsx)
```

### **Backend Structure**
```
backend/src/
├── routes/
│   └── authRoutes.ts           # Authentication endpoints
├── middleware/
│   └── authMiddleware.ts       # JWT token verification
├── controllers/
│   └── authController.ts       # Auth business logic
├── utils/
│   ├── bcrypt.ts               # Password hashing
│   └── jwt.ts                  # Token generation/verification
└── index.ts                    # Main server file
```

---

## 🗄️ Database Schema (Prisma)

### **New Models to Add**
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String   // Hashed password
  name          String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Optional: Link scans to users (for multi-user support)
  // scans        Scan[]   @relation("UserScans")
}

// Optional: For tracking user-specific scans
model Scan {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation("UserScans", fields: [userId], references: [id])
  scanType      String   // "full", "instances", "volumes", "eips"
  status        String   // "completed", "failed", "running"
  createdAt     DateTime @default(now())
}
```

---

## 🔐 Authentication Method: JWT (JSON Web Tokens)

### **Why JWT?**
- Stateless (no server-side session storage needed)
- Scalable
- Works well with React SPA
- Secure when properly implemented

### **Token Flow**
```
1. User logs in → Backend validates credentials
2. Backend generates JWT token (contains userId, email)
3. Token sent to frontend → Stored in localStorage/sessionStorage
4. Frontend includes token in API requests (Authorization header)
5. Backend middleware verifies token on protected routes
6. Token expires after X hours (e.g., 24 hours)
7. On expiry → User redirected to login
```

---

## 📡 API Endpoints

### **Authentication Endpoints**
```
POST   /api/auth/register
  Body: { email, password, name? }
  Response: { token, user: { id, email, name } }

POST   /api/auth/login
  Body: { email, password }
  Response: { token, user: { id, email, name } }

POST   /api/auth/logout
  Headers: { Authorization: "Bearer <token>" }
  Response: { message: "Logged out successfully" }

GET    /api/auth/me
  Headers: { Authorization: "Bearer <token>" }
  Response: { user: { id, email, name } }

POST   /api/auth/refresh
  Headers: { Authorization: "Bearer <token>" }
  Response: { token } // New token
```

### **Protected Endpoints (Modified)**
```
GET    /api/results
  Headers: { Authorization: "Bearer <token>" }
  → Requires authentication

POST   /api/scan
  Headers: { Authorization: "Bearer <token>" }
  → Requires authentication
```

---

## 🎨 Frontend Implementation Details

### **1. Auth Context (Global State)**
```typescript
// AuthContext.tsx
- Manages: isAuthenticated, user, token, loading
- Provides: login(), logout(), register(), checkAuth()
- Persists token in localStorage
- Auto-refreshes token if expired
```

### **2. Protected Routes**
```typescript
// ProtectedRoute.tsx
- Wraps Dashboard component
- Checks if user is authenticated
- If not → Redirect to /login
- If yes → Render Dashboard
```

### **3. Login/SignUp Pages**
```typescript
// Login.tsx & SignUp.tsx
- Beautiful forms matching dashboard design
- Form validation
- Error handling
- Loading states
- Link to switch between login/signup
```

### **4. Routing Structure**
```typescript
// App.tsx
Routes:
  /login → Login page
  /signup → SignUp page
  /dashboard → Protected Dashboard (current App.tsx content)
  / → Redirect to /dashboard (if auth) or /login (if not)
```

---

## 🔒 Security Features

### **Password Security**
- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ Minimum 8 characters required
- ✅ Password confirmation on registration

### **Token Security**
- ✅ JWT signed with secret key (stored in .env)
- ✅ Token expiration (24 hours)
- ✅ HTTP-only cookies option (alternative to localStorage)
- ✅ Token refresh mechanism

### **API Security**
- ✅ All protected routes verify JWT token
- ✅ CORS configured properly
- ✅ Input validation on all endpoints
- ✅ Rate limiting (optional, for production)

---

## 📦 Dependencies to Install

### **Backend**
```bash
npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs
```

### **Frontend**
```bash
npm install react-router-dom
# (React Router for navigation)
```

---

## 🚀 Implementation Steps

### **Phase 1: Backend Setup**
1. ✅ Add User model to Prisma schema
2. ✅ Run migration: `npx prisma migrate dev`
3. ✅ Install JWT & bcrypt packages
4. ✅ Create auth utilities (jwt.ts, bcrypt.ts)
5. ✅ Create auth routes & controllers
6. ✅ Add auth middleware
7. ✅ Protect existing API endpoints

### **Phase 2: Frontend Setup**
1. ✅ Install react-router-dom
2. ✅ Create AuthContext
3. ✅ Create Login & SignUp components
4. ✅ Create ProtectedRoute component
5. ✅ Set up routing in App.tsx
6. ✅ Move Dashboard to separate component
7. ✅ Add token to API requests

### **Phase 3: Integration & Testing**
1. ✅ Test registration flow
2. ✅ Test login flow
3. ✅ Test protected routes
4. ✅ Test token expiration
5. ✅ Test logout
6. ✅ UI/UX polish

---

## 🎯 Key Features

### **User Experience**
- ✅ Smooth transitions between auth and dashboard
- ✅ Remember user session (localStorage)
- ✅ Auto-redirect after login
- ✅ Clear error messages
- ✅ Loading states during auth
- ✅ "Remember me" option (optional)

### **Developer Experience**
- ✅ Clean separation of concerns
- ✅ Reusable auth utilities
- ✅ Type-safe with TypeScript
- ✅ Easy to extend (e.g., OAuth later)

---

## 🔄 State Management Flow

```
User Action → AuthContext → API Call → Backend
                                    ↓
                            Token + User Data
                                    ↓
                            Store in Context + localStorage
                                    ↓
                            Update UI (redirect to dashboard)
```

---

## 📝 Environment Variables

### **Backend (.env)**
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-super-secret-key-here"
JWT_EXPIRES_IN="24h"
PORT=3001
```

---

## ✅ Summary

This authentication system will:
1. ✅ Require users to register/login before accessing dashboard
2. ✅ Use JWT tokens for secure authentication
3. ✅ Protect all API endpoints
4. ✅ Provide smooth user experience
5. ✅ Be scalable and maintainable
6. ✅ Follow security best practices

---

## 🤔 Questions for You

1. **Token Storage**: localStorage or sessionStorage? (I recommend localStorage for "remember me" functionality)

2. **Token Expiration**: How long should tokens last? (I suggest 24 hours)

3. **Multi-User Scans**: Should each user see only their own scan results, or shared results? (I suggest shared for now, can add user-specific later)

4. **Password Requirements**: Any specific requirements? (I suggest min 8 chars, can add complexity rules)

5. **UI Design**: Should login/signup pages match the royal purple dashboard theme?

---

**Ready to proceed?** Let me know if you'd like any changes to this plan, and I'll start implementing! 🚀


