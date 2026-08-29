# 🚀 MockVerse(AI) — Production Deployment Guide

This guide provides step-by-step instructions for deploying **MockVerse(AI)** to production.

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION ARCHITECTURE                  │
├─────────────────┬───────────────────────────────────────────┤
│ Frontend        │ Vercel (Vite + React SPA)                 │
│ Backend API     │ Render (Node.js / Express Web Service)    │
│ Database        │ MongoDB Atlas (Cloud Managed Replica Set) │
│ AI Engine       │ Google Gemini API (@google/genai)         │
└─────────────────┴───────────────────────────────────────────┘
```

---

## 📑 Table of Contents
1. [Prerequisites & Account Setup](#1-prerequisites--account-setup)
2. [Step 1: MongoDB Atlas Setup](#step-1-mongodb-atlas-setup)
3. [Step 2: Google Gemini AI API Key](#step-2-google-gemini-ai-api-key)
4. [Step 3: Backend Deployment (Render)](#step-3-backend-deployment-render)
5. [Step 4: Frontend Deployment (Vercel)](#step-4-frontend-deployment-vercel)
6. [Step 5: Final CORS & Health Check Verification](#step-5-final-cors--health-check-verification)
7. [Environment Variables Reference](#environment-variables-reference)
8. [Production Smoke Test Checklist](#production-smoke-test-checklist)
9. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## 1. Prerequisites & Account Setup
Before deploying, make sure you have:
- A [GitHub](https://github.com/) account with the MockVerse repository pushed.
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (Free M0 or higher).
- A [Google AI Studio](https://aistudio.google.com/apikey) account for Gemini API keys.
- A [Render](https://render.com/) account for backend hosting.
- A [Vercel](https://vercel.com/) account for frontend hosting.

---

## Step 1: MongoDB Atlas Setup

1. **Log in to MongoDB Atlas** and create a new project.
2. **Create a Database Deployment**:
   - Choose the **M0 Free** tier.
   - Select your preferred Cloud Provider and Region (e.g. AWS / us-east-1 or ap-south-1).
3. **Configure Database Security**:
   - **Database User**: Create a user with username (e.g., `mockverse_admin`) and a secure password.
   - **Network Access**: Add IP Address `0.0.0.0/0` (Allow access from anywhere) so Render can connect dynamically.
4. **Retrieve Connection String**:
   - Click **Connect** > **Drivers** (Node.js).
   - Copy the SRV URI. It looks like:
     ```
     mongodb+srv://mockverse_admin:<password>@cluster0.xxxxx.mongodb.net/mockverse?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password and specify `/mockverse` as the database name.

---

## Step 2: Google Gemini AI API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey).
2. Click **Create API key** and select or create a Google Cloud project.
3. Copy the generated API key (`AIzaSy...`).

---

## Step 3: Backend Deployment (Render)

You can deploy using Render's Blueprint (`render.yaml`) or manually:

### Option A: Automatic Blueprint Deployment (Recommended)
1. In Render Dashboard, click **New +** > **Blueprint**.
2. Connect your GitHub repository.
3. Render will read `render.yaml` and configure the Web Service automatically.
4. Fill in the required secret environment variables (`MONGODB_URI`, `GEMINI_API_KEY`, `CLIENT_URL`).

### Option B: Manual Web Service Setup
1. In Render Dashboard, click **New +** > **Web Service**.
2. Connect your GitHub repository.
3. Fill in the service settings:
   - **Name**: `mockverse-backend`
   - **Environment**: `Node`
   - **Region**: Select the region closest to your MongoDB Atlas cluster.
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. In **Advanced > Health Check Path**, set:
   ```
   /health
   ```
5. Add the following **Environment Variables**:
   | Variable | Value / Description |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` (or leave default, Render sets `PORT` automatically) |
   | `MONGODB_URI` | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/mockverse?retryWrites=true&w=majority` |
   | `JWT_SECRET` | *Strong random string (e.g. 64 hex characters)* |
   | `GEMINI_API_KEY` | *Your Google Gemini API Key* |
   | `CLIENT_URL` | *Your Vercel frontend URL (e.g., `https://your-mockverse.vercel.app`)* |
6. Click **Create Web Service** and wait for the deployment to finish.
7. Copy your backend URL: `https://your-mockverse-backend.onrender.com`.

---

## Step 4: Frontend Deployment (Vercel)

1. **Log in to Vercel** and click **Add New** > **Project**.
2. **Import your GitHub Repository**.
3. **Configure Project Settings**:
   - **Framework Preset**: `Vite` (auto-detected).
   - **Root Directory**: Click *Edit* and select **`frontend`** (DO NOT deploy root directly).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Set Environment Variables**:
   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | `https://your-mockverse-backend.onrender.com/api` |
   *(Note: Ensure `/api` is included at the end of your Render backend URL).*
5. Click **Deploy**.
6. Once deployed, note your live Vercel domain (e.g., `https://mockverse-app.vercel.app`).

---

## Step 5: Final CORS & Health Check Verification

1. Go back to Render Dashboard > Your Backend Web Service > **Environment**.
2. Ensure `CLIENT_URL` is set to your actual Vercel URL:
   ```
   CLIENT_URL=https://mockverse-app.vercel.app
   ```
3. Test backend health:
   - Visit `https://your-mockverse-backend.onrender.com/health` in your browser.
   - Expected response:
     ```json
     {
       "success": true,
       "status": "ok",
       "service": "mockverse-backend"
     }
     ```
   - Diagnostic status: `https://your-mockverse-backend.onrender.com/api/health`
     ```json
     {
       "success": true,
       "status": "healthy",
       "service": "mockverse-backend",
       "database": "connected"
     }
     ```

---

## 🔑 Environment Variables Reference

### Backend (`Render`)
```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mockverse?retryWrites=true&w=majority

# Security
JWT_SECRET=a_very_secure_random_64_character_hex_string

# AI Provider
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-3.6-flash # (optional override)

# CORS
CLIENT_URL=https://your-mockverse-frontend.vercel.app
```

### Frontend (`Vercel`)
```env
VITE_API_URL=https://your-mockverse-backend.onrender.com/api
```

---

## 🧪 Production Smoke Test Checklist

After completing deployment, verify the entire workflow:

- [ ] **1. Frontend Load**: Open your Vercel URL. Landing page renders with no console errors.
- [ ] **2. Health Endpoints**: `/health` and `/api/health` return HTTP 200 with `database: connected`.
- [ ] **3. User Registration**: Create a new account with email and password.
- [ ] **4. User Login**: Log in with credentials and receive JWT session token.
- [ ] **5. Question Paper Generation**:
  - Select Subject, Class, Difficulty, Marks, and Chapters.
  - Click **Generate Exam Sheet**.
  - Verify AI generates questions in real-time.
- [ ] **6. Paper Solutions**: Generate model answers and step-by-step solutions.
- [ ] **7. Evaluation**: Type answers, submit for grading, and review AI scoring and feedback.
- [ ] **8. History**: View saved papers under the **History** tab and load previous exams.
- [ ] **9. Study Resources & Collections**:
  - Create a study resource sheet.
  - Add resources (YouTube, GitHub, PDFs, articles).
  - Export PDF / HTML study sheets and view QR code.
- [ ] **10. Profile & Custom API Key**: Add a custom user API key in Profile settings and test generation.
- [ ] **11. Rate Limiting Protection**: Concurrent click protection prevents duplicate simultaneous generations.
- [ ] **12. Logout & Re-login**: Verify session termination and protected route guards.

---

## 🛠️ Troubleshooting & FAQ

### 1. CORS Errors (`Blocked by CORS policy`)
- Verify that `CLIENT_URL` on Render matches your exact Vercel URL (e.g. `https://mockverse.vercel.app` with no trailing slash).
- Both `CLIENT_URL` and `FRONTEND_URL` are supported.
- Render automatically allows all preview subdomains matching `*.vercel.app`.

### 2. Network Error / Failed to Fetch
- Check that `VITE_API_URL` on Vercel ends with `/api` (e.g. `https://mockverse.onrender.com/api`).
- If you modified environment variables on Vercel, trigger a **Redeploy** to bake the new `VITE_API_URL` into Vite's client build.

### 3. MongoDB Connection Timeout
- Verify your IP Access List in MongoDB Atlas includes `0.0.0.0/0`.
- Verify the username and password in `MONGODB_URI` have no unescaped special characters.

### 4. Gemini API 429 Quota Exceeded
- MockVerse includes automatic response caching (30 min) and exponential backoff retry.
- If the server default key quota is exhausted, users can input their own free Gemini key in **Profile Settings** to continue generating without interruption.
