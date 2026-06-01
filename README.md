# MockVerse.(AI) — Paper Pal Smart Grade 🌟

MockVerse.(AI) is a state-of-the-art, full-stack educational AI workspace that empowers students and educators to **generate high-fidelity question papers**, **explore step-by-step solutions**, **evaluate submitted answers with deep metrics**, and **discuss concepts in real-time** with an active AI study assistant.

This project is built using a modern **MySQL, Express, React, and Node.js (PERN) Stack**, using **Prisma ORM** for type-safe database access, **JWT token security**, and secure backend proxying of **Google Gemini AI**.

---

## 🏗️ Folder Structure & Architecture

The project has been restructured into a clean, modern, dedicated multi-directory setup:

```text
MockVerse(Ai)
├── backend/                  # Express API Server & Database configs
│   ├── prisma/               # Prisma Database Schemas & Migrations
│   │   └── schema.prisma     # MySQL Schema definition
│   ├── src/
│   │   ├── config/           # Database instances (Prisma)
│   │   ├── controllers/      # Auth & AI Paper controllers
│   │   ├── middleware/       # JWT route guard middleware
│   │   └── server.js         # Express listener & static file server
│   ├── .env.example          # Sample environment templates
│   ├── .gitignore            # Backend ignore filters
│   └── package.json          # Node dependencies & run scripts
│
├── frontend/                 # Vite + React + TS Client Application
│   ├── public/               # Static assets & illustrations
│   │   └── images/           # Premium Vector Workspace Hero illustrations
│   ├── src/
│   │   ├── components/       # Shadcn UI widgets, chatbot, & menus
│   │   ├── contexts/         # React Theme & Auth global state handlers
│   │   ├── hooks/            # Toast notifications & states
│   │   ├── pages/            # Auth login & Main dashboard page layouts
│   │   └── services/         # apiService.ts client fetching layer
│   ├── index.html            # Core entry layout HTML
│   ├── vite.config.ts        # Vite routing & compiler maps
│   ├── tailwind.config.ts    # Custom dashboard color tokens (indigo/pink/slate)
│   └── package.json          # Client dependencies & scripts
│
├── .gitignore                # Global version control ignores (generated PDFs, local envs)
└── README.md                 # Complete full-stack guide & manuals (This File)
```

### 🤝 Data Sync Diagram
```mermaid
graph TD
    Client[Vite React + TS Client :8080] <-->|JSON / JWT Header| Server[Express.js Node Server :5000]
    Server <-->|Prisma Client| DB[(MySQL Database)]
    Server <-->|Secure Https SDK| Gemini[Google Gemini 1.5 Flash AI API]
```

---

## 🚀 Key Features

* **🔐 Advanced JWT Authentication**: Secure glassmorphic user registration (signup) and login. Passwords are encrypted on the server with `bcryptjs`. Session states are isolated per-user.
* **✨ Split-Screen Authorization Design**: A premium double-column landing layout containing the glassmorphic authentication cards on the left, and a beautiful vector **AI Dashboard Workspace illustration** on the right.
* **📝 AI Question Paper Generator**: Generate comprehensive exam papers by specifying Subject, Grade/Class, Chapters, Board patterns (NCERT, CBSE, etc.), Difficulty level (Easy, Medium, Hard), and custom instructions.
* **✏️ Step-by-Step Solutions**: Instantiate complete solution keys with explanations, alternative approaches, and final answer highlights for any generated exam.
* **📊 AI Answer Evaluation**: Input student answers and receive an analytical score sheet, including total marks obtained, a percentage rating, and granular, question-by-question academic feedback.
* **💬 Context-Aware AI Chatbot**: A companion study bot that remembers the context of the active question paper to explain terms, give conceptual hints, and encourage the student.
* **📜 Persistent Exam History**: All question papers, solution sheets, and grading records are stored in a MySQL database so users can view their academic journey at any time.

---

## 📦 API Endpoints Reference

### 🔑 Authentication Routes (`/api/auth/*`)
* `POST /api/auth/signup` - Register a new user account. Returns user metadata and JWT token.
* `POST /api/auth/login` - Login with credentials. Returns user metadata and JWT token.
* `GET /api/auth/profile` - Get the logged-in user profile details (JWT Protected).

### 📝 Question Paper & AI Routes (`/api/papers/*`)
* `POST /api/papers` - Generate and save a new question paper (JWT Protected).
* `GET /api/papers` - Fetch the authenticated user's complete paper history (JWT Protected).
* `GET /api/papers/:id` - Fetch the detailed question paper by ID (JWT Protected).
* `DELETE /api/papers/:id` - Delete a question paper by ID (JWT Protected).
* `POST /api/papers/:id/solutions` - Generate step-by-step solution keys (JWT Protected).
* `POST /api/papers/:id/evaluate` - Grade and evaluate student answers (JWT Protected).

### 💬 Chatbot Route (`/api/chat/*`)
* `POST /api/chat` - Message the educational chatbot inside the active paper context (JWT Protected).

---

## ⚙️ Environment Configuration

Create a `.env` file inside the `/backend` folder with the following variables:

```env
PORT=5000
DATABASE_URL="mysql://YOUR_MYSQL_USER:YOUR_MYSQL_PASSWORD@localhost:3306/mockverse"
JWT_SECRET="your_secure_jwt_random_string_key"
GEMINI_API_KEY="your_google_gemini_api_key"
```

---

## ⚡ Quickstart Guide

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **MySQL** server installed and active on your system.

### 2. Backend Installation & Migration
Navigate to the `/backend` folder:
```bash
# Enter backend directory
cd backend

# Install server-side dependencies
npm install

# Run Prisma schema migrations to set up MySQL database tables
npx prisma migrate dev --name init
```

### 3. Frontend Installation
Navigate to the `/frontend` folder in a separate terminal:
```bash
# Enter frontend directory
cd frontend

# Install frontend-side dependencies
npm install
```

### 4. Running the Servers Locally

#### Launch the Express Backend (Port 5000):
```bash
cd backend
npm run dev
```

#### Launch the Vite Frontend (Port 8080):
```bash
cd frontend
npm run dev
```
Open `http://localhost:8080` in your web browser.

---

## 🐳 Deployment Readiness & Production Build

### Serve Static Files Collectively
To support seamless production deployments (e.g. Heroku, Render, AWS, or DigitalOcean), the Express backend has been configured to serve the static client assets:

1. **Build the Frontend Assets**:
   ```bash
   # From the /frontend directory, compile Vite React static files
   cd frontend
   npm run build
   ```
   This generates standard, highly optimized HTML/CSS/JS bundles in `/frontend/dist`.

2. **Run in Production Mode**:
   Set `NODE_ENV=production` on your hosting service environment variables. 
   When starting the backend with `npm start`, the Express server will automatically serve the static `/frontend/dist` files, allowing you to run the complete MERN application on a single port!
