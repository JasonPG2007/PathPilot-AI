# 🚀 PathPilot AI

> Turn your career goals into a personalized learning roadmap with AI.

PathPilot AI is an AI-powered goal planning application built for **OpenAI Build Week 2026**.

Instead of functioning like a traditional chatbot, PathPilot uses a multi-agent workflow to generate, critique, and refine personalized learning roadmaps that help learners achieve their career or education goals.

---

## ✨ Features

- 🎯 Transform career goals into personalized learning roadmaps
- 🧠 Planner Agent creates an initial roadmap
- 🔍 Critic Agent reviews workload, prerequisites, and feasibility
- 🛠 Planner Agent revises the roadmap using AI feedback
- 📚 Structured learning phases, milestones, and projects
- ⚡ Built with GPT-5.6 and accelerated by Codex

---

## 🏗 Architecture

```

Frontend (React)

↓

ASP.NET Core API

↓

Planner Agent

↓

Critic Agent

↓

Planner Revision

↓

Final Roadmap

```

---

## 🖥 Tech Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS

### Backend

- ASP.NET Core Web API
- C#

### AI

- OpenAI GPT-5.6
- OpenAI Responses API
- Codex

---

## 📂 Project Structure

```

pathpilot-ai/

├── frontend/

├── backend/

├── docs/

│ ├── PROJECT_SPEC.md

│ ├── ARCHITECTURE.md

│ └── PROMPTS.md

└── README.md

```

---

## 🚦 Current Status

Project is currently under active development for **OpenAI Build Week 2026**.

Completed:

- [x] Project planning
- [x] Technical architecture
- [x] Prompt design

In Progress:

- [ ] Frontend UI
- [ ] Backend API
- [ ] Planner Agent
- [ ] Critic Agent
- [ ] GPT-5.6 Integration

---

## 🎯 MVP

The first release includes:

- Goal input form
- Planner Agent
- Critic Agent
- Final AI roadmap

Future versions may include:

- Progress tracking
- Reflection Agent
- Coach Agent
- Learning analytics

---

## 📄 Documentation

Project documentation is located in `/docs`.

- PROJECT_SPEC.md
- ARCHITECTURE.md
- PROMPTS.md

---

## 📜 License

MIT License
