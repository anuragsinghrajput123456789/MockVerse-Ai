# MockVerse(AI) — Paper Pal Smart Grade 🌟

MockVerse(AI) is a state-of-the-art, production-grade educational AI workspace that empowers students and educators to **generate high-fidelity question papers**, **explore worked solutions**, **evaluate submitted answers with deep metrics**, and **discuss concepts in real-time** with an active AI study tutor.

This project is built using a modern **MongoDB, Express, React, and Node.js (MERN) Stack**, using **Mongoose** for direct, high-performance database access, **JWT token security**, and secure backend proxying of **Google Gemini AI**.

---

## 📸 Product Preview

<div align="center">
  <img src="frontend/public/images/mockverse_workspace_hero.png" alt="MockVerse Workspace Preview" width="600" style="border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.5);" />
  <p><em>Immersive full-stack AI-powered educational ecosystem.</em></p>
</div>

---

## 🏗️ Folder Structure & Architecture

The project has been restructured into a clean, modern, dedicated multi-directory setup:

```text
MockVerse(Ai)
├── backend/                  # Express API Server & Database configs
│   ├── src/
│   │   ├── config/           # Database connectivity (Mongoose)
│   │   ├── controllers/      # Auth & AI Paper/Resource controllers
│   │   ├── middleware/       # JWT route guard middleware
│   │   ├── models/           # Mongoose schemas (User, QuestionPaper)
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
    Server <-->|Mongoose Queries| DB[(MongoDB Database)]
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
* **📚 CRUD Study Library**: Add study notes, textbooks, and tutorial resources. Modify details or purge records at any time.
* **🔗 Base64 Quick Sharing**: Click to copy an encrypted Base64 URL for any library item, allowing quick sharing. Visiting users receive an interactive import overlay popup.
* **📄 Clickable HTML Export**: Click the download action to compile your resource into a beautiful standalone single-file HTML sheet containing active clickable links.
* **📜 Persistent Exam History**: All question papers, solution sheets, and grading records are stored in a MongoDB database so users can view their academic journey at any time.

---

## 📦 API Endpoints Reference

| Category | Endpoint | Method | Access | Description |
| :--- | :--- | :---: | :---: | :--- |
| **Auth** | `/api/auth/signup` | `POST` | Public | Register a new user account. Returns metadata and JWT. |
| **Auth** | `/api/auth/login` | `POST` | Public | Login with credentials. Returns metadata and JWT. |
| **Auth** | `/api/auth/profile` | `GET` | Private | Get details of the logged-in user profile. |
| **Papers** | `/api/papers` | `POST` | Private | Generate and save a new custom AI question paper. |
| **Papers** | `/api/papers` | `GET` | Private | Fetch the authenticated user's complete paper history. |
| **Papers** | `/api/papers/:id` | `GET` | Private | Fetch a detailed question paper by ID. |
| **Papers** | `/api/papers/:id` | `DELETE` | Private | Delete a question paper by ID. |
| **Papers** | `/api/papers/:id/solutions` | `POST` | Private | Generate step-by-step worked solutions for a paper. |
| **Papers** | `/api/papers/:id/evaluate` | `POST` | Private | Evaluate student answers and get itemized scorecards. |
| **Chat** | `/api/chat` | `POST` | Private | Message the chatbot within the active paper context. |

---

## ⚙️ Environment Configuration

Create a `.env` file inside the `/backend` folder with the following variables:

```env
PORT=5000
MONGODB_URI="mongodb://127.0.0.1:27017/mockverse"
JWT_SECRET="your_secure_jwt_random_string_key"
GEMINI_API_KEY="your_google_gemini_api_key"
```

---

## ⚡ Quickstart Guide

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **MongoDB** server (Community Edition or MongoDB Atlas cluster) active on your system.

### 2. Backend Installation
Navigate to the `/backend` folder:
```bash
# Enter backend directory
cd backend

# Install server-side dependencies
npm install
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
To support seamless production deployments (e.g. Heroku, Render, AWS, or DigitalOcean), the Express backend is configured to serve the static client assets:

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
