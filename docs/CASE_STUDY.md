# MockVerse(AI) — Full-Stack Software Engineering Case Study 🌟

**MockVerse(AI)** is a production-grade, highly optimized educational AI workspace that empowers students and educators to **generate high-fidelity question papers**, **solve exam sets under simulated conditions**, **evaluate answer sheets with line-by-line AI scoring feedback**, and **interact in real-time with grounded AI tutors**.

---

## 📖 1. Project Overview & Motivation
Creating balanced, syllabus-aligned exam papers, formulating step-by-step solutions, and providing constructive, itemized grading feedback has historically been a manual, time-intensive process. **MockVerse(AI)** was built to automate these workflows. 

By leveraging the **MERN Stack** (MongoDB, Express, React, Node.js) and secure proxy connections to **Google Gemini AI**, MockVerse(AI) transforms academic preparation into a seamless, data-rich, and interactive digital experience.

---

## 🏁 2. Executive Summary
MockVerse(AI) introduces an all-in-one educational workspace:
1. **Dynamic Generation:** Prompts Gemini AI using custom chapters, syllabus parameters (CBSE, NCERT, ICSE), classes, and difficulty scales to assemble balanced, complete exam sheets.
2. **Smart Answer Evaluation:** Evaluates written student responses against standard answer keys, calculating precise score marks, percentages, and question-by-question conceptual feedback.
3. **Study Library & Sharing:** Enables users to bookmark textbooks, notes, and study sheets, copy Base64 sharing links, and export materials as stand-alone clickable HTML files.
4. **Context-Grounded Tutor:** Implements a floating AI chat assistant grounded dynamically in the student's active exam questions and solutions.

---

## ⚠️ 3. Problem Statement

### A. For Students Preparing for Exams
- **Lack of Custom Practice:** Traditional mock tests are generic. Students cannot generate highly targeted, chapter-specific exams to focus on their unique weaknesses.
- **Delayed Feedback Loop:** Solving papers is useless without grading. Waiting days for teachers to grade mock tests slows down critical conceptual correction.

### B. For Teachers & Faculty
- **Syllabus Constraints:** Building balanced question sets that align with specific boards (CBSE, NCERT) and difficulty targets takes hours of manual review.
- **Grading Bottlenecks:** Line-by-line answer grading for large classrooms consumes massive administrative hours, leaving little time for individual student mentoring.

### C. For Competitive Aspirants & Placement Candidates
- **Syllabus Overwhelm:** Navigating complex domain subjects requires organized reference materials.
- **Lack of Domain Evaluation:** Candidates lack direct, instant grading on written technical essay questions.

---

## 💡 4. Why I Built This Project
As a developer, I observed how modern study frameworks are either fragmented (scattered notes and separate PDF generators) or lack immediate, specific conceptual evaluations. 

My goals while building MockVerse(AI) were to:
1. **Implement Secure Proxying:** Secure proprietary API tokens inside backend environments, preventing network token exposure.
2. **Build High-Fidelity UX:** Style an immersive, dark-mode-first glassmorphism dashboard that matches the premium developer aesthetics of Vercel and Linear.
3. **Master Document-Based Architecture:** Pivot from a legacy relational SQLite database to MongoDB + Mongoose, optimizing JSON array queries and document retrieval speeds.

---

## 👥 5. User Personas

```
+-------------------------------------------------------------------------------------------------------------------+
| 1. COLLEGE STUDENT (RAHUL, 21)                                                                                    |
| Goal: Wants to practice targeted chapter-wise exams for university engineering papers.                              |
| Need: Instant worked step-by-step solution keys and conceptual tutoring.                                         |
+-------------------------------------------------------------------------------------------------------------------+
| 2. COMPETITIVE EXAM ASPIRANT (PRIYA, 24)                                                                          |
| Goal: Preparing for CBSE board or IAS exams requiring written answer evaluations.                                 |
| Need: Immediate, constructive line-by-line feedback with marking scorecards.                                      |
+-------------------------------------------------------------------------------------------------------------------+
| 3. CLASSROOM TEACHER (MR. KAPOOR, 45)                                                                             |
| Goal: Create chapter-specific mock sheets conforming to CBSE standards in under 60 seconds.                        |
| Need: Bulk question generators and simple, structured export templates.                                            |
+-------------------------------------------------------------------------------------------------------------------+
| 4. PLACEMENT ASPIRANT (AMIT, 22)                                                                                  |
| Goal: Tests verbal written coding conceptual skills.                                                              |
| Need: Mock question sets and an interactive, grounded AI interview chat helper.                                   |
+-------------------------------------------------------------------------------------------------------------------+
```

---

## 🎯 6. Feature Analysis

### A. Question Paper Generator
- **Purpose:** Constructs balanced, syllabus-aligned test sheets instantly.
- **User Benefit:** Highly customizable parameters (difficulty, classes, specific chapters, custom pattern instructions).
- **Technical Implementation:** Express backend prompts Gemini AI with chapters, total marks, and CBSE constraints, saving the returned Markdown content in MongoDB.
- **Future Scope:** Adaptive difficulty generation based on student historical marks trends.

### B. AI Answer Evaluation Engine
- **Purpose:** Provides instantaneous line-by-item answer grading.
- **User Benefit:** Saves hours of grading lag; outlines exact mistakes and key conceptual corrections.
- **Technical Implementation:** Merges paper questions with submitted answer arrays, prompt-engineering Gemini to score, summarize, and return structured evaluations.
- **Future Scope:** OCR engine support enabling users to upload handwriting snapshots directly.

### C. Resource Library & Sharing
- **Purpose:** Manages study books and notes checklists.
- **User Benefit:** One-click Base64 clipboard sharing and single-file clickable HTML downloads.
- **Technical Implementation:** Mongoose schemas support CRUD. Base64 URL queries parse instantly on mount. HTML downloader compiles a styled tailwind script.
- **Future Scope:** Collaborative shared class folders with real-time sync.

---

## ⚙️ 7. Technology Stack Decisions & Trade-offs

| Technology | Selected For | Alternative Considered | Chosen Over Alternative Because |
| :--- | :--- | :--- | :--- |
| **MongoDB / Mongoose** | Storage Layer | MySQL + Prisma | MongoDB handles large, text-rich markdown question sheets and solution buffers natively. Storing chapters as native `[String]` arrays avoids costly JSON serialization/deserialization cycles required in relational SQL engines. |
| **React + TypeScript** | Client Layer | Vanilla JS / Angular | Type interfaces (`QuestionPaper`, `Resource`) caught database mapping and component schema bugs at compile-time rather than in runtime crash logs, improving delivery speeds. |
| **Node.js / Express** | API Layer | Python / Django | Express's asynchronous event loop manages I/O-heavy API proxy requests (like waiting for Gemini prompts) concurrently without blocking database processes. |
| **Google Gemini AI** | AI Engine | OpenAI GPT-4o | Flash-latest provides massive 8K output tokens, near-instantaneous responses, and cost-efficient developer rate limits. |

---

## 🔁 8. Request Lifecycle

```
+------------------+     1. Submit Form      +---------------------+
|  Vite React UI   | ----------------------> | frontend/service.ts |
+------------------+                         +---------------------+
         ^                                              |
         | 7. Hydrate State                             | 2. Post /api/papers
         |                                              v
+------------------+     6. JSON Return      +---------------------+
|  Index Dashboard | <---------------------- |  Express Backend    |
+------------------+                         +---------------------+
                                                        |
                                                        | 3. Format CBSE Prompt
                                                        v
                                             +---------------------+
                                             |   Google Gemini     |
                                             +---------------------+
                                                        |
                                                        | 4. Return Markdown
                                                        v
                                             +---------------------+
                                             | Mongoose (MongoDB)  |
                                             +---------------------+
                                                        |
                                                        | 5. Save Document
                                                        v
                                             [(  MongoDB Store   )]
```

---

## 📊 9. Database Design

### Mongoose Schema Structures

#### 1. User Model
```javascript
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: '' }
}, { timestamps: true });
```

#### 2. QuestionPaper Model
```javascript
const questionPaperSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  class: { type: String, required: true },
  totalMarks: { type: Number, required: true },
  difficulty: { type: String, required: true },
  board: { type: String, required: true },
  chapters: { type: [String], required: true },
  topics: { type: String, default: '' },
  instructions: { type: String, default: '' },
  pattern: { type: String, required: true },
  questions: { type: String, required: true },
  solutions: { type: String, default: '' },
  evaluationResult: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
```

---

## 🔒 10. Security Measures
1. **Double-Ended JWT Security:** Tokens are generated on backend auth, signed with `JWT_SECRET`, and validated before any AI or database transaction.
2. **Database Cast Error Prevention:** Every ID query validates via `mongoose.Types.ObjectId.isValid(decoded.id || req.params.id)`. UUID tokens are caught cleanly as `401 Unauthorized` without causing database memory errors.
3. **Protected Routes:** React Context wraps active dashboards, automatically rerouting unauthenticated visitors to clean glass login containers.

---

## 🐳 11. Scalability Analysis

```
+-------------------------------------------------------------------------------------------------------------------+
| 1,000 CONCURRENT USERS                                                                                            |
| Structure: Single free-tier Render web instance proxying MongoDB Atlas cluster.                                  |
| Bottleneck: Node event loop remains idle; standard Atlas connections satisfy concurrency queries.                 |
+-------------------------------------------------------------------------------------------------------------------+
| 10,000 CONCURRENT USERS                                                                                           |
| Structure: Load balanced PM2 clusters; Redis caching layers for public question library resources.              |
| Bottleneck: Gemini API rate limit limits. Implement backend request queues using BullMQ/Redis.                   |
+-------------------------------------------------------------------------------------------------------------------+
| 100,000 CONCURRENT USERS                                                                                          |
| Structure: Horizontal scaling with Docker on AWS ECS. MongoDB sharded across write-heavy region nodes.             |
| Bottleneck: Implement asynchronous pub-sub architectures using AWS SQS.                                           |
+-------------------------------------------------------------------------------------------------------------------+
```

---

## 🌟 12. Interview Questions & Answers

### Q1: Why did you build MockVerse(AI)?
"I wanted to build a unified full-stack ecosystem that integrates syllabus-aligned testing with immediate, itemized feedback loops. By proxying Google Gemini AI securely in the backend, I built a system where students generate custom, chapter-focused question sheets, solve them under time-limits, and get evaluated instantly."

### Q2: Why did you choose MongoDB over MySQL for this application?
"AI outputs like comprehensive question papers and step-by-step solution keys contain massive, text-rich Markdown structures that vary significantly in size and schema depth. Storing these in a document database like MongoDB is highly efficient. Furthermore, storing chapter lists natively as string arrays (`[String]`) in Mongoose prevents the expensive JSON stringify and parse cycles required by relational databases."

### Q3: What is the most challenging bug you solved on this project?
"During the database migration from SQLite to MongoDB, returning clients carried legacy JWT tokens encoding their user ID as a UUID string. When Mongoose queried `User.findById(decoded.id)`, the BSON parser threw an unhandled `CastError`. I resolved this by inserting Mongoose `ObjectId.isValid()` validators inside the authentication middleware. Outdated session tokens are caught and rejected as `401 Unauthorized`, gracefully logging out the user to get a fresh MongoDB token instead of crashing the server."

---

## 📄 13. ATS Resume Content

* **MockVerse(AI) — Full-Stack Software Engineer** | *MERN, TypeScript, Tailwind, Gemini AI, Mongoose*
  - Engineered a full-stack educational AI workspace using React, TypeScript, Node, and Express, compiling static client assets collectively to reduce hosting costs.
  - Migrated the data storage layer from SQLite/Prisma to MongoDB/Mongoose, improving JSON array query speeds by eliminating JSON serialization overhead.
  - Implemented secure backend proxy controllers for Google Gemini AI, shielding API credentials from client inspectors.
  - Built robust middleware filters using `mongoose.Types.ObjectId.isValid()`, resolving database CastError exceptions and preventing API crashes.
  - Styled an immersive dark-mode-first glassmorphism dashboard, implementing responsive breakpoints and sliding drawers with backdrop overlays.
