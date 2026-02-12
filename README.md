<<<<<<< HEAD
<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=220&text=SaasSentry&fontAlign=50&fontAlignY=40&color=gradient" />

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?size=26&duration=2500&pause=600&center=true&vCenter=true&width=700&lines=Secure+AWS+Cloud+Cost+Monitoring;Real-time+Resource+Tracking;Cost+Optimization+%7C+Authentication+%7C+Dashboard;Built+with+React+%2B+Node+%2B+TypeScript" />
</p>

<p align="center">
  <b>Modern, secure application to monitor, manage and optimize AWS cloud costs with advanced authentication & resource controls.</b>
</p>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Node-%3E%3D16-brightgreen?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
</p>

<br/>

<img src="https://user-images.githubusercontent.com/74038190/212897739-3b2c1f44-1b18-4ed9-a16d-3b1d8b04e354.gif" width="70%"/>

</div>

---

## ✨ What is SaasSentry?

**SaasSentry** is a secure and scalable application that helps you **monitor AWS resources**, track **real-time usage**, and identify **cloud cost optimization opportunities** — all through a clean dashboard with robust authentication.

---

## ⚡ Key Highlights

✅ **Secure Authentication System (JWT + bcrypt)**  
✅ **AWS Resource Monitoring & Tracking**  
✅ **Cost Analysis + Optimization Insights**  
✅ **Real-time Resource Activity View**  
✅ **EIP Management Support**  
✅ **Role-friendly UI with clean experience**  

---

## 🧩 Tech Stack

### 🎨 Frontend
- ⚛️ React + TypeScript  
- ⚡ Vite build tooling  
- 🎯 Context API state management  
- 📱 Responsive UI

### 🧠 Backend
- 🟩 Node.js + TypeScript  
- 🚀 Express.js REST APIs  
- 🔐 JWT Authentication  
- 🧬 Prisma ORM  
- 🔒 Encryption utilities

---

## 🏗️ Project Structure

```bash
saas-sentry/
├── backend/
│   ├── prisma/
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── types/
│       └── utils/
│
└── frontend/
    ├── public/
    └── src/
        ├── components/
        │   ├── auth/
        │   └── ...
        ├── context/
        └── assets/
=======
# CloudGuard ☁️💰🛡️

**Intelligent Cloud Cost Optimization & Security Monitoring Platform**

CloudGuard helps you identify idle resources, security vulnerabilities, and cost-saving opportunities in your AWS infrastructure.

![CloudGuard Dashboard](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### 💰 Cost Optimization
- **Idle Resource Detection** - Find unused EC2 instances, EBS volumes, and Elastic IPs
- **Right-Sizing Recommendations** - Get AI-powered suggestions to downsize resources
- **Cost Forecasting** - Predict future spending with anomaly detection
- **Automated Remediation** - One-click resource termination and scheduling

### 🛡️ Security Monitoring
- **Security Group Analysis** - Detect overly permissive firewall rules
- **S3 Bucket Scanning** - Check encryption, versioning, and public access
- **IAM Policy Review** - Identify excessive permissions
- **CIS Compliance Dashboard** - Track security benchmark compliance

### 📊 Advanced Features
- **Smart Alerting** - Customizable thresholds with Email/Slack notifications
- **Real-time Dashboard** - Beautiful glassmorphic UI with animations
- **Bulk Operations** - Manage multiple resources simultaneously
- **Historical Analytics** - Track cost trends over time

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL database
- AWS account with credentials

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/cloudguard.git
   cd cloudguard
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your database URL and secrets
   # Then run Prisma migrations
   npx prisma generate
   npx prisma db push
   
   # Start backend server
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Copy environment template
   cp .env.example .env
   
   # Start frontend dev server
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options

**Frontend (Vercel)**
- [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
- Set `VITE_API_URL` to your backend URL

**Backend (Render)**
- [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)
- Add PostgreSQL database
- Set environment variables from `.env.example`

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization

### Backend
- **Node.js + Express** - API server
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **AWS SDK** - Cloud integration
- **JWT** - Authentication

## 📸 Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Cost Forecast
![Cost Forecast](./screenshots/forecast.png)

### Security Compliance
![Security](./screenshots/security.png)

## 🔐 Security

- **Encrypted Credentials** - AWS keys stored with AES encryption
- **JWT Authentication** - Secure user sessions
- **HTTPS Only** - All production traffic encrypted
- **No AWS Keys Stored** - Users provide their own credentials

## 📝 Environment Variables

### Backend
```env
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=your-32-char-key
JWT_SECRET=your-jwt-secret
PORT=3001
NODE_ENV=production
```

### Frontend
```env
VITE_API_URL=https://your-backend-url.com
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- AWS SDK for cloud integration
- Prisma for database management
- Vercel & Render for hosting platforms
- The open-source community

## 📧 Support

For support, email support@cloudguard.io or open an issue on GitHub.

---

**Built with ❤️ for cloud cost optimization**
>>>>>>> e4a47df (Updated the UI,added new logic and added the logo)
