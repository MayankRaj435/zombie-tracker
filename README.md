# 🛡️ CloudGuard

A modern, secure application for monitoring and optimizing AWS cloud costs with advanced authentication and resource management capabilities.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D%2016.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-%5E5.0.0-blue)
![React](https://img.shields.io/badge/react-%5E18.0.0-blue)

## 🚀 Features

- 🔐 Secure Authentication System
- 📊 AWS Resource Monitoring
- 💰 Cost Analysis and Optimization
- 🔄 Real-time Resource Tracking
- 🛠️ User-friendly Dashboard
- 🔒 EIP Management

## 🏗️ Project Structure

```
├── backend/                  # Backend server application
│   ├── prisma/              # Database schema and migrations
│   └── src/
│       ├── controllers/     # Request handlers
│       ├── middleware/      # Express middleware
│       ├── routes/         # API routes
│       ├── types/         # TypeScript type definitions
│       └── utils/         # Utility functions
│
├── frontend/                # React frontend application
│   ├── public/             # Static files
│   └── src/
│       ├── components/     # React components
│       │   ├── auth/      # Authentication components
│       │   └── ...
│       ├── context/       # React context providers
│       └── assets/        # Images and other assets
```

## 🛠️ Technology Stack

- **Frontend**:
  - React with TypeScript
  - Vite for build tooling
  - Modern CSS with responsive design
  - Context API for state management

- **Backend**:
  - Node.js with TypeScript
  - Prisma ORM
  - JWT Authentication
  - Express.js
  - Secure encryption utilities

## 🚀 Getting Started

1. Clone the repository
2. Set up the backend:
   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npm run dev
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

For detailed setup instructions, please refer to [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)

## 📚 Documentation

- [User Setup Guide](./USER_SETUP_GUIDE.md) - **Start Here!** Complete setup instructions for new users
- [Tech Stack](./TECH_STACK.md) - Complete technology stack and their roles
- [Authentication Plan](./AUTHENTICATION_PLAN.md)
- [Resource Access Plan](./RESOURCE_ACCESS_PLAN.md)
- [Quick Start Guide](./QUICK_START.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

## 🔒 Security

This project implements several security best practices:
- Secure password hashing with bcrypt
- JWT-based authentication
- Input validation and sanitization
- Encrypted sensitive data storage
- Secure API endpoints with middleware protection

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">
Made with ❤️ for secure cloud management
</div>