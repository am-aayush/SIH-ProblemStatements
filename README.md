# SIH 2025/2026 Problem Statements & Team Management Portal

A comprehensive full-stack application designed to explore Smart India Hackathon (SIH) 2025 and 2026 problem statements, manage hackathon teams, and provide a secure Master Admin dashboard for tracking overarching analytics.

## 🚀 Features

### 🔍 Problem Explorer
- **Dual Year Support**: Easily toggle between SIH 2025 and SIH 2026 problem statements.
- **Advanced Filtering**: Filter problems by Theme, Organization, Category (Hardware/Software), and availability of Datasets or YouTube links.
- **Multiple Views**: Switch between Grid, Table, and Compact layouts.
- **Bookmarks & Comparison**: Bookmark your favorite problem statements and compare multiple problems side-by-side to make the best choice.

### 👥 Team Management
- **Leader & Member Roles**: Dedicated signup and login flows for team leaders and members.
- **Team Dashboard**: Centralized hub for teams to track their project progress.
- **Progress Tracking**: Daily standup logs, submission tracker, and customizable skill matrices.
- **Meetings**: Schedule and manage team meetings efficiently.

### 👑 Master Admin System
- **Secure Authentication**: OTP-based login (via Email/Resend) combined with JWT session management.
- **Isolated Dashboard**: A completely separate, read-only analytics view for overarching application data.
- **Analytics & Insights**: View total teams, leaders, member statistics, and track the most bookmarked/discussed ideas across the entire platform.

## 💻 Tech Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS v4
- React Router DOM
- React Hook Form + Zod (Validation)
- Recharts (Data Visualization)
- Lucide React (Icons)

**Backend:**
- Node.js & Express
- MongoDB (Mongoose)
- JSON Web Tokens (JWT) for authentication
- Resend (for Master Admin OTP delivery)
- Bcrypt.js

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (local or Atlas)
- Resend API key (for OTP emails)

### 1. Clone the repository
```bash
git clone <repository-url>
cd SIH2025PS
```

### 2. Environment Variables
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
MASTER_ADMIN_EMAIL=your_admin_email@example.com
MASTER_ADMIN_JWT_SECRET=your_master_jwt_secret
RESEND_API_KEY=your_resend_api_key
```

### 3. Install Dependencies
The project includes a unified build script that installs both frontend and backend dependencies:
```bash
npm run build
```
*(Alternatively, you can run `npm install` in the root, and `cd server && npm install`)*

### 4. Running the Application Locally

**Development Mode (Frontend Only):**
```bash
npm run dev
```
*(Ensure to set `VITE_API_URL=http://localhost:5000/api` in your frontend `.env` if testing locally with the backend).*

**Production Mode (Frontend + Backend on the same port):**
```bash
npm run build
npm start
```
The application will be served at `http://localhost:5000`.

## 📦 Deployment

This project is configured to be deployed as a single monolithic "Web Service" on platforms like Render.
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start` (or `node server/server.js`)

> **Note**: The build command automatically builds the Vite frontend into the `dist/` directory, and the Express backend serves it using `express.static`. Ensure all environment variables are added to your hosting provider.

## 🤝 Contributing

Contributions are welcome! If you find any bugs or want to add a new feature, feel free to open an issue or submit a pull request.
