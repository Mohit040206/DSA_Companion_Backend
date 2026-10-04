# Ancora ⚓ — The AI-Powered DSA & Technical Interview Preparation Engine

> **Ancora** is a personalized, history-driven Data Structures & Algorithms (DSA) learning platform and interview preparation engine. Built to eliminate generic advice, Ancora synthesizes real-time public web research with your actual problem attempt history, AI code evaluations, and Memory Engine insights to deliver an adaptive roadmap for technical interviews.

---

## 🌟 The Vision

Traditional DSA practice platforms offer static lists of top interview questions (e.g. "Top 100 Amazon Questions") regardless of a candidate's actual skill level. A candidate who already masters HashMap frequency counting is forced to solve basic questions, while another who struggles with time complexity analysis receives no targeted feedback.

**Ancora solves this mismatch by unifying:**
1. **Real-time Web Research**: Aggregates current candidate interview reports without hallucinating guaranteed company questions.
2. **Personalized Skill Horizons**: Evaluates pattern mastery, confidence ratings, and AI-identified misconceptions to tailor question difficulty.
3. **Factual Memory Engine**: Tracks a candidate's breakthroughs and recurring mistakes over time.
4. **Spaced Repetition Engine**: Automatically queues low-confidence or AI-flagged attempts for timed revisions.

---

## ⚡ Key Features

### 🏢 1. Company Preparation Engine
* **Target Company & Role Alignment**: Personalizes weekly preparation roadmaps for target companies (*Amazon, Google, Meta, Microsoft, Razorpay, Uber, etc.*) and roles (*SDE-1, Senior Backend, Fullstack*).
* **Real Web Research & Provenance**: Scrapes public interview reports via DuckDuckGo and Groq synthesis, storing structured source metadata (`title`, `url`, `sourceType`, `accessedAt`).
* **Community Question Disclaimers**: Explicitly labels community-reported questions as non-guaranteed reports.
* **Dual Rationale Breakdown**: Each week highlights:
  * 🌐 **Company Research Rationale**: Context extracted from candidate reports.
  * 🧠 **Personal Performance & AI Rationale**: Tailored logic based on your attempt history and weak pattern repair.
* **Non-Destructive Recalculation**: Recalculate plans on demand without deleting historical attempts or revision queues.

---

### 🎯 2. Timed Mock Interview Mode
* **45-Minute Assessment**: Simulates realistic technical interviews under a strict 45-minute countdown timer.
* **Multi-Language Workspace**: Supports **Java, C++, Python, JavaScript, TypeScript, and Go** with prefilled starter templates.
* **Embedded Problem Description Drawer**: Expandable panel featuring problem overview, learning objectives, prerequisites, and 1-click external platform links (*LeetCode / GFG*).
* **Hybrid 3-Stage AI Hinting**:
  * *Initial Phase*: Offline pattern and strategy focus hints.
  * *Coding Phase*: Live AI code analysis that inspects your line-by-line implementation to deliver non-spoiler, targeted hints.
* **Automated AI Evaluation**: Submitting a mock session immediately triggers the AI Evaluator to grade correctness, derived complexity, and edge cases.

---

### 🤖 3. AI Recommendation Engine & Evaluator
* **Adaptive Problem Router**: Chooses the optimal next problem based on your strategy preference:
  * **Depth-First Mastery**: Focuses on weak/developing patterns until strong.
  * **Breadth-First Exploration**: Broadens exposure across unattempted patterns.
* **Static Code Evaluator**: Analyzes submitted solution code to derive $O(N)$ time & space complexity, verify correctness, and suggest targeted retry focus areas.

---

### 🧠 4. Factual Memory Engine
* Tracks learning milestones, AHA insights, and repeated mistakes.
* Displays a timeline of candidate progress directly on the main dashboard.

---

### 🔄 5. Spaced Repetition Revision Engine
* Attempts rated $\le 2$ stars or flagged by AI evaluation automatically queue into spaced repetition cards.
* Revisions can be started, skipped, or resolved to build long-term pattern retention.

---

### 📚 6. Problem Directory & Admin Portal
* **Comprehensive Directory**: Filter problems by difficulty (*Easy, Medium, Hard*), platform (*LeetCode, GeeksForGeeks*), pattern tags, and status.
* **Admin Management**: Dedicated portal for bulk CSV/JSON problem imports, user role management, and database re-seeding.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Router DOM v6
* **Backend**: Node.js, Express.js, MongoDB (Mongoose ORM), Cookie-Parser, JWT Authentication
* **AI & Web Search**: Groq API (`llama-3.3-70b-versatile`), DuckDuckGo Search Scraping, Fallback Heuristic Engine

---

## 📁 Directory Structure

```text
dsa-tracker/
├── client/                      # React Frontend (Vite)
│   ├── src/
│   │   ├── components/          # AppShell, Modals, Toast, AI Cards
│   │   ├── context/             # AuthContext, ThemeContext
│   │   ├── pages/               # Dashboard, CompanyPrep, InterviewMode, Problems, Revisions, Settings, Admin
│   │   └── services/            # Axios client & API endpoints
│   └── vercel.json              # Vercel SPA rewrite configuration
│
├── server/                      # Express Backend
│   ├── config/                  # Database connection setup
│   ├── middleware/              # Auth & RBAC authorization middleware
│   ├── modules/
│   │   ├── ai/                  # Recommendation, Memory, AI Evaluation & Hint Services
│   │   ├── attempt/             # Attempt tracking service & controllers
│   │   ├── auth/                # User authentication & password endpoints
│   │   ├── companyPrep/         # Company Search Web scraper & Prep Engine
│   │   ├── problem/             # Problem CRUD & bulk import controllers
│   │   ├── revision/            # Spaced repetition engine
│   │   └── user/                # User profile management
│   ├── app.js                   # Express application routes & middleware
│   └── server.js                # Server entry point & port listener
│
└── package.json                 # Root dependencies & start script
```

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js**: v18.0.0 or higher
* **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster connection string.
* **Groq API Key**: (Optional) Get a free key at [Groq Console](https://console.groq.com/).

### 2. Environment Variables Setup
Create a `.env` file in the `server/` directory (or root):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/dsa_companion
SECERATE_KEY=your_jwt_secret_key_here
GROQ_API_KEY=your_groq_api_key_here
NODE_ENV=development
```

### 3. Installation & Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/dsa-tracker.git
cd dsa-tracker

# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..

# Run backend server
npm start

# In a separate terminal, run frontend Vite development server
cd client
npm run dev
```

The frontend will be available at `http://localhost:5173` and the API at `http://localhost:5000/api`.

---

## 📄 License
This project is licensed under the ISC License.
