# MockVerse(AI) Deployment Guide

This guide describes how to deploy the **MockVerse(AI)** application, hosting the **frontend on Vercel** and the **backend API on Render**.

---

## 1. Backend Deployment (Render)

Deploy the backend as a Web Service on Render:

1. **Sign up / Log in** to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service** (or use the **Blueprint** option with `render.yaml`).
3. Connect your GitHub repository containing the project.
4. Set the following configuration options:
   - **Name**: `mockverse-ai-backend` (or any custom name)
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **Advanced** to add the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or leave default, Render auto-binds)
   - `MONGODB_URI`: *Your MongoDB Atlas connection string* (e.g. `mongodb+srv://...`)
   - `JWT_SECRET`: *A secure random string for signing JWT tokens*
   - `GEMINI_API_KEY`: *Your Google Gemini API Key*
   - `FRONTEND_URL`: *Your Vercel deployment URL* (e.g. `https://your-app.vercel.app`) - *Note: You can add this after deploying the frontend.*
6. Click **Create Web Service**.
7. Copy your backend's live URL (e.g. `https://mockverse-ai-backend.onrender.com`).

---

## 2. Frontend Deployment (Vercel)

Deploy the frontend on Vercel:

1. **Sign up / Log in** to your [Vercel Dashboard](https://vercel.com/).
2. Click **Add New** > **Project** and import your GitHub repository.
3. Configure the following project settings:
4. **Framework Preset**: `Vite` (Vercel should detect this automatically).
5. **Root Directory**: Select `frontend` (Important: do not use the root folder).
6. **Build and Development Settings**:
   - Keep default build command: `npm run build` (or `vite build`)
   - Keep default output directory: `dist`
7. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-onrender-url.onrender.com/api` (replace with your actual Render backend URL followed by `/api`).
8. Click **Deploy**.
9. Once deployed, copy your Vercel deployment URL and add/update it as the `FRONTEND_URL` environment variable in your Render backend settings so CORS allows requests.

---

## Local Development Reminders

If you want to run the project locally after these configurations:
1. In the `backend` directory, create a `.env` file containing your local keys. Run `npm run dev` to start the backend.
2. In the `frontend` directory, create a `.env` file containing `VITE_API_URL=http://localhost:5000/api`. Run `npm run dev` to start the frontend.
