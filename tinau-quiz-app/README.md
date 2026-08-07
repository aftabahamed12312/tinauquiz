# 🏫 TINAU SCHOOL — Quiz Competition System

An enterprise-grade, real-time Quiz Competition Management System built for **Tinau School** (Butwal-11, Devinagar). The platform features an interactive Public Board, Admin Control Panel, Host/Quizmaster Console, and House Leader Interfaces with real-time score updates, round management, question locking, timer handling, and Dockerized orchestration.

---

## 📍 Project Info

- **Institution:** TINAU SCHOOL
- **Location:** Butwal-11, Devinagar, Rupandehi, Nepal
- **Tech Stack:** React.js (Vite), Node.js, Express.js, MongoDB, Socket.io, Docker, pnpm
- **UI Theme:** Soft Pink & White (`Header: #FF69B4 / #FFB6C1`, `Accent: #FF1493`, `Background: #FFF5F7 / #FFFFFF`)

---

## 🏗 System Architecture

Four real-time panels stay synchronized over Socket.io:

```
                    ┌───────────────────────────┐
                    │     ADMIN CONTROL PANEL    │
                    │ (Houses, Rounds, Topics,   │
                    │  Question Bank, Accounts)  │
                    └─────────────┬───────────────┘
                                  │
              ┌───────────────────┴───────────────────┐
              │                                       │
    ┌─────────▼─────────┐                 ┌───────────▼──────────┐
    │     HOST PANEL     │                 │   HOUSE LEADER PANEL  │
    │ (Ask/Pass/Reveal,   │                 │ (Pick questions on    │
    │  Timers, Scoring)   │                 │  your turn)           │
    └─────────┬─────────┘                 └───────────┬──────────┘
              │                                       │
              └───────────────────┬───────────────────┘
                                  │
                    ┌─────────────▼───────────────┐
                    │     PUBLIC BOARD DASHBOARD    │
                    │ (Scores, Media, Timer,        │
                    │  Answer Reveal — for a         │
                    │  projector / TV screen)        │
                    └───────────────────────────────┘
```

---

## 💻 Panel Specifications

### 1. 📺 Public Board Dashboard (`/` or `/board`)
No login required — built for a projector or TV. Shows the live question, synced countdown, a "TIME IS UP!" banner, the answer reveal animation, and a real-time scoreboard.

### 2. ⚙️ Admin Panel (`/admin`)
Full supervision & control:
- House & player management (create houses, assign leaders)
- Round & topic management, including activating a round
- Comprehensive Question Bank: full CRUD, text/image/audio media, per-question timer & points
- Host / House Leader account creation
- One-click full session reset

**Default Admin Credentials**
| Field | Value |
| --- | --- |
| Username | `ADMIN@tinau.com` |
| Password | `tebs@2056` |

### 3. 🎙 Host Panel — Quizmaster Console (`/host`)
- Browse the whole question bank, filter by round
- Ask a question to a specific house → locks it (`AVAILABLE → ASKED`)
- Start/stop the countdown timer, or force "Time's up"
- Reveal the answer and award points to the winning house in one click
- Pass an unanswered/timed-out question to the next house
- Adjust house scores by hand (±5) and set the active turn

### 4. 🚩 House Leader Panel (`/house`)
- Sees an interactive grid of AVAILABLE questions for the active round
- Can only pick a question when it's their house's turn (server-enforced)
- Watches the shared timer and question media live

---

## 🧠 Business Logic

1. **Question lifecycle:** `AVAILABLE → ASKED → REVEALED / PASSED / COMPLETED`. Once asked or revealed, a question is locked server-side and cannot be re-picked.
2. **Timers:** the server stamps an `endsAt` epoch time on `timer:start`; every client counts down from that same timestamp, so all screens stay in sync regardless of network latency.
3. **Scoring:** points are awarded automatically when the Host reveals an answer with a winning house, or can be adjusted manually from the Host panel.
4. **Real-time sync:** every state-changing REST call also emits a Socket.io event, so the Board / Admin / Host / House panels update instantly with no polling or page reloads.
5. **Auth:** JWT-based, three roles — `admin`, `host`, `house_leader` — enforced both by frontend routing and backend middleware.

---

## 📁 Project Structure

```
tinau-quiz-app/
├── docker-compose.yml
├── pnpm-workspace.yaml
├── .env.example
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── uploads/                  # Uploaded images/audio (Docker volume)
│   └── src/
│       ├── config/                # db.js, seedAdmin.js
│       ├── controllers/           # auth, house, question, round, topic, quiz
│       ├── models/                # User, House, Topic, Round, Question
│       ├── routes/
│       ├── sockets/                # quizSocket.js
│       ├── middlewares/            # authMiddleware, uploadMiddleware
│       └── server.js
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── components/
        │   ├── Header.jsx, Timer.jsx, MediaViewer.jsx, ProtectedRoute.jsx
        │   ├── Admin/     (HouseManager, RoundTopicManager, QuestionBankManager, UserManager)
        │   ├── Host/      (QuestionControlPanel, HouseScoreControls)
        │   ├── House/     (QuestionGrid)
        │   └── Board/     (Scoreboard, AnswerReveal)
        ├── pages/          (BoardDashboard, AdminDashboard, HostDashboard, HouseDashboard, Login)
        ├── services/        (api.js, socket.js, auth.js)
        ├── App.jsx
        └── main.jsx
```

---

## 🚀 Installation & Setup

### Prerequisites
- [Docker Engine](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/)
- [Node.js (v18+)](https://nodejs.org/) — for local (non-Docker) development
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

### Option 1 — Docker (recommended for event day)

```bash
cd tinau-quiz-app
cp .env.example .env      # adjust secrets if you like
docker-compose up --build -d
```

- Public Board: **http://localhost:3000**
- Admin / Host / House login: **http://localhost:3000/login**
- Backend API: **http://localhost:5000/api**

The default admin account is seeded automatically on first backend startup.

### Option 2 — Local development with pnpm

```bash
pnpm install --recursive

# Start MongoDB locally (or via `docker run -p 27017:27017 mongo:7`)

cd backend
cp ../.env.example .env
pnpm dev

# in a second terminal
cd frontend
pnpm dev
```

---

## 🔑 Default Credentials Summary

| Role | Username / Email | Password | Access |
| --- | --- | --- | --- |
| System Admin | `ADMIN@tinau.com` | `tebs@2056` | Full control — houses, rounds, topics, question bank, accounts |
| Host / Quizmaster | Created by Admin | Assigned by Admin | Ask/pass/reveal questions, control timers |
| House Leader | Created by Admin | Assigned by Admin | Pick questions, view active turn |

⚠️ Change the default admin password (`ADMIN_PASS` in `.env`) before running a real event.

---

## 📄 License

Designed and maintained for Tinau School, Butwal-11, Devinagar. All rights reserved.
