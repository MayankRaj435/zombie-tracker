# 🛠️ Tech Stack Documentation - CloudGuard

This document outlines all the technologies, frameworks, and libraries used in the CloudGuard project and their specific roles.

---

## 📋 Table of Contents

- [Frontend Technologies](#frontend-technologies)
- [Backend Technologies](#backend-technologies)
- [Database & ORM](#database--orm)
- [Authentication & Security](#authentication--security)
- [Cloud Services](#cloud-services)
- [Development Tools](#development-tools)
- [Deployment](#deployment)

---

## 🎨 Frontend Technologies

### **React 19.1.1**
**Role:** Core UI framework
- Builds the user interface with component-based architecture
- Manages component state and lifecycle
- Enables reactive UI updates based on data changes
- Provides hooks for state management (`useState`, `useEffect`, `useContext`)

### **React Router DOM 7.9.5**
**Role:** Client-side routing and navigation
- Handles navigation between pages (Login, SignUp, Dashboard, ConnectAWS)
- Protects routes with authentication checks
- Enables programmatic navigation
- Manages browser history

### **TypeScript 5.9.3**
**Role:** Type-safe JavaScript
- Adds static typing to catch errors at compile time
- Improves code maintainability and developer experience
- Provides IntelliSense and autocomplete
- Ensures type safety across the entire application

### **Vite 7.1.7**
**Role:** Build tool and development server
- Fast development server with Hot Module Replacement (HMR)
- Optimized production builds
- Handles bundling and code splitting
- Provides fast refresh for React components

### **Recharts**
**Role:** Data visualization library
- Creates interactive charts and graphs for statistics
- Displays resource trends over time
- Shows cost analysis with line and bar charts
- Provides responsive chart components

### **CSS3 (Custom Styling)**
**Role:** Styling and visual design
- Implements royal purple theme with glassmorphism effects
- Creates responsive layouts
- Adds animations and transitions
- Ensures cross-browser compatibility with vendor prefixes

---

## ⚙️ Backend Technologies

### **Node.js**
**Role:** JavaScript runtime environment
- Executes server-side JavaScript code
- Handles HTTP requests and responses
- Manages file system operations
- Provides event-driven, non-blocking I/O

### **Express.js 5.1.0**
**Role:** Web application framework
- Creates RESTful API endpoints
- Handles HTTP requests (GET, POST, DELETE)
- Manages middleware (CORS, authentication, error handling)
- Routes requests to appropriate controllers

### **TypeScript 5.9.3**
**Role:** Type-safe backend development
- Ensures type safety in API endpoints
- Validates request/response types
- Improves code quality and maintainability
- Enables better IDE support

### **ts-node-dev 2.0.0**
**Role:** Development server with TypeScript support
- Automatically restarts server on file changes
- Transpiles TypeScript to JavaScript on-the-fly
- Provides fast development feedback loop

---

## 🗄️ Database & ORM

### **PostgreSQL**
**Role:** Relational database
- Stores user accounts and authentication data
- Persists AWS scan results (instances, volumes, EIPs)
- Maintains relationships between users and their resources
- Provides ACID compliance for data integrity

### **Prisma 6.19.0**
**Role:** Object-Relational Mapping (ORM)
- Generates type-safe database client
- Manages database schema and migrations
- Provides query builder with TypeScript types
- Handles database connections and pooling
- Simplifies database operations with intuitive API

---

## 🔐 Authentication & Security

### **JSON Web Tokens (JWT) - jsonwebtoken 9.0.2**
**Role:** Stateless authentication
- Generates secure tokens for user sessions
- Validates user identity on protected routes
- Enables token-based authentication
- Stores user information in encrypted tokens

### **bcryptjs 3.0.3**
**Role:** Password hashing
- Securely hashes user passwords before storage
- Uses bcrypt algorithm for one-way encryption
- Prevents password exposure in database breaches
- Compares hashed passwords during login

### **crypto-js 4.2.0**
**Role:** Data encryption
- Encrypts AWS credentials before database storage
- Uses AES encryption algorithm
- Decrypts credentials when needed for AWS API calls
- Protects sensitive user data

---

## ☁️ Cloud Services

### **AWS SDK v3**
**Role:** AWS service integration

#### **@aws-sdk/client-ec2 3.925.0**
- Scans EC2 instances
- Retrieves instance details (ID, type, status)
- Identifies idle instances based on CPU usage

#### **@aws-sdk/client-cloudwatch 3.925.0**
- Fetches CloudWatch metrics
- Analyzes CPU utilization over time
- Determines if instances are idle (< 5% CPU)

#### **@aws-sdk/client-pricing 3.927.0**
- Retrieves AWS pricing information
- Calculates estimated monthly costs
- Provides cost data for instances and volumes

---

## 🛠️ Development Tools

### **ESLint 9.36.0**
**Role:** Code linting and quality
- Enforces coding standards
- Catches potential bugs and errors
- Ensures consistent code style
- Provides React-specific linting rules

### **TypeScript ESLint 8.45.0**
**Role:** TypeScript-specific linting
- Validates TypeScript code patterns
- Enforces type-safe practices
- Catches type-related issues

### **dotenv 17.2.3**
**Role:** Environment variable management
- Loads configuration from `.env` files
- Manages sensitive credentials securely
- Separates development and production configs

### **dotenv-cli 11.0.0**
**Role:** Environment variable CLI tool
- Runs scripts with environment variables
- Useful for database migrations and scripts

---

## 📦 Additional Libraries

### **CORS 2.8.5**
**Role:** Cross-Origin Resource Sharing
- Enables frontend-backend communication
- Handles cross-origin requests
- Configures allowed origins for security

### **node-cron 4.2.1**
**Role:** Scheduled tasks (if needed)
- Can schedule periodic scans
- Automates background tasks
- Manages recurring operations

---

## 🎯 Technology Roles Summary

### **Frontend Stack:**
```
React → UI Components & State Management
React Router → Navigation & Route Protection
TypeScript → Type Safety
Vite → Build Tool & Dev Server
Recharts → Data Visualization
CSS3 → Styling & Animations
```

### **Backend Stack:**
```
Node.js → Runtime Environment
Express → API Framework
TypeScript → Type Safety
Prisma → Database ORM
PostgreSQL → Data Storage
```

### **Security Stack:**
```
JWT → Authentication Tokens
bcryptjs → Password Hashing
crypto-js → Credential Encryption
```

### **AWS Integration:**
```
AWS SDK (EC2) → Instance Scanning
AWS SDK (CloudWatch) → Metrics Analysis
AWS SDK (Pricing) → Cost Calculation
```

---

## 🔄 Data Flow

1. **User Authentication:**
   - Frontend (React) → Backend (Express) → Database (PostgreSQL via Prisma)
   - Password hashed with bcryptjs
   - Token generated with JWT

2. **AWS Scanning:**
   - User connects AWS → Credentials encrypted with crypto-js → Stored in database
   - Scan triggered → Backend decrypts credentials → AWS SDK calls AWS APIs
   - Results stored in database → Frontend fetches and displays

3. **Data Visualization:**
   - Backend aggregates statistics → Frontend fetches via API
   - Recharts renders interactive charts
   - Real-time updates on new scans

---

## 📊 Architecture Overview

```
┌─────────────────┐
│   React Frontend │
│  (Vite + TS)     │
└────────┬─────────┘
         │ HTTP/REST
         │
┌────────▼─────────┐
│  Express Backend  │
│   (Node + TS)     │
└────────┬──────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│Prisma │ │ AWS   │
│  ORM  │ │  SDK  │
└───┬───┘ └───────┘
    │
┌───▼──────┐
│PostgreSQL│
│ Database │
└──────────┘
```

---

## 🚀 Why These Technologies?

- **React:** Industry standard, large ecosystem, excellent developer experience
- **TypeScript:** Catches errors early, improves maintainability
- **Express:** Lightweight, flexible, perfect for REST APIs
- **Prisma:** Type-safe, modern ORM with excellent DX
- **PostgreSQL:** Reliable, feature-rich, perfect for relational data
- **AWS SDK:** Official AWS library, comprehensive service coverage
- **JWT:** Stateless authentication, scalable
- **Vite:** Fastest build tool, excellent HMR

---

## 📝 Version Information

All versions are locked in `package.json` files to ensure consistency across development and production environments.

---

**Last Updated:** 2024
**Project:** CloudGuard - AWS Cloud Waste Monitoring Dashboard





