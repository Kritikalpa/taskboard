# Trello Clone (TaskBoard)

A full-stack Kanban board application built with React and Express.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, Tailwind CSS 4, Framer Motion |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL |
| Drag & Drop | @dnd-kit |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL running on `localhost:5432`

### Setup

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Create the database
createdb trello_clone
psql trello_clone < backend/src/db/schema.sql

# Seed sample data (optional)
psql trello_clone < backend/src/db/seed.sql
```

### Run

```bash
# Terminal 1 — backend (port 3000)
cd backend && npm run dev

# Terminal 2 — frontend (port 5173)
cd frontend && npm run dev
```

Open `http://localhost:5173`.

## Walkthrough

[![TaskBoard Walkthrough](https://img.shields.io/badge/watch-walkthrough-F22F46?style=for-the-badge&logo=loom)](https://www.loom.com/share/4a6207e1c7a2478e8e9bc650774091d0)

## Project Structure

```
backend/
  src/
    config/     — DB connection
    controllers/ — Route handlers
    services/   — Business logic
    db/         — Schema & seed SQL
    middleware/  — Error handling
    routes/     — Express route definitions
  server.js     — Entry point

frontend/
  src/
    api/        — Axios client & endpoint modules
    components/ — Board, list, card, shared components
    context/    — Board state (useReducer)
    pages/      — HomePage, BoardPage
    hooks/      — Custom hooks
    utils/      — DnD reorder helpers
```

## API

Base URL: `https://taskboard-sigma-five.vercel.app/api`

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for all endpoints.
