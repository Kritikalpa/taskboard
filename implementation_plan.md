# Trello-like Project Management App — Full Implementation Plan

## Tech Stack

| Layer | Choice |
|-------|--------|
| Backend | Node.js + Express.js |
| Database | PostgreSQL (raw `pg` driver, no ORM) |
| Frontend | React (Vite) + TailwindCSS |
| Architecture | Monorepo — `backend/` and `frontend/` under one root |

---

## Folder Structure

```
trello-clone/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                   # PostgreSQL connection pool
│   │   ├── db/
│   │   │   ├── schema.sql              # All CREATE TABLE statements
│   │   │   └── init.js                 # Script to run schema.sql against DB
│   │   ├── routes/
│   │   │   ├── users.routes.js
│   │   │   ├── boards.routes.js
│   │   │   ├── boardlists.routes.js
│   │   │   └── cards.routes.js
│   │   ├── controllers/
│   │   │   ├── users.controller.js
│   │   │   ├── boards.controller.js
│   │   │   ├── boardlists.controller.js
│   │   │   └── cards.controller.js
│   │   ├── services/
│   │   │   ├── users.service.js
│   │   │   ├── boards.service.js
│   │   │   ├── boardlists.service.js
│   │   │   └── cards.service.js
│   │   ├── middleware/
│   │   │   └── errorHandler.js         # Global error handler
│   │   └── app.js                      # Express app setup + route mounting
│   ├── server.js                       # Entry point
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/
│   │   │   ├── boards.js               # API calls for boards
│   │   │   ├── boardlists.js           # API calls for board lists
│   │   │   ├── cards.js                # API calls for cards
│   │   │   └── users.js                # API calls for users
│   │   ├── components/
│   │   │   ├── Board/
│   │   │   │   ├── BoardCard.jsx       # Single board preview card
│   │   │   │   └── BoardForm.jsx       # Create/edit board form
│   │   │   ├── BoardList/
│   │   │   │   ├── BoardListColumn.jsx # A single list column
│   │   │   │   └── BoardListForm.jsx   # Create/edit list form
│   │   │   ├── Card/
│   │   │   │   ├── CardItem.jsx        # Single card item
│   │   │   │   └── CardForm.jsx        # Create/edit card form
│   │   │   └── shared/
│   │   │       ├── Navbar.jsx
│   │   │       ├── Modal.jsx
│   │   │       └── Spinner.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx            # All boards listing
│   │   │   └── BoardPage.jsx           # Single board with lists + cards
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── API_DOCUMENTATION.md
└── README.md
```

---

## Database Design

### Tables

```sql
-- 1. users
CREATE TABLE users (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(100)  NOT NULL,
  email VARCHAR(255)  NOT NULL UNIQUE
);

-- 2. boards
CREATE TABLE boards (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(255) NOT NULL,
  privacy  VARCHAR(10)  NOT NULL DEFAULT 'PUBLIC'
             CHECK (privacy IN ('PUBLIC', 'PRIVATE')),
  url      VARCHAR(255) UNIQUE   -- set after INSERT as '/boards/{id}'
);

-- 3. board_members  (join table: many users <-> many boards)
CREATE TABLE board_members (
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id  INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  PRIMARY KEY (board_id, user_id)
);

-- 4. board_lists
CREATE TABLE board_lists (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(255) NOT NULL,
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0
);

-- 5. cards
CREATE TABLE cards (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  board_list_id INTEGER REFERENCES board_lists(id) ON DELETE CASCADE,
  assigned_user INTEGER REFERENCES users(id) ON DELETE SET NULL,
  position      INTEGER NOT NULL DEFAULT 0
);
```

### Design Decisions

- `ON DELETE CASCADE` on `board_members`, `board_lists`, and `cards` enforces the deletion chain automatically at the DB level — no extra service logic needed.
- `assigned_user` uses `ON DELETE SET NULL` so deleting a user unassigns them from cards without losing the card.
- `position` on both `board_lists` and `cards` enables ordering without a separate table.
- `url` is stored in the `boards` table and populated in a second UPDATE right after INSERT, derived as `/boards/{id}`.
- Assignment eligibility (user must be a board member) is enforced at the **service layer**, not the DB.

---

## API Design

### Base URL
```
http://localhost:3000/api
```

### Users

| Method | Path | Description |
|--------|------|-------------|
| POST | `/users` | Create a user |
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get one user |

### Boards

| Method | Path | Description |
|--------|------|-------------|
| POST | `/boards` | Create a board (privacy defaults to PUBLIC) |
| GET | `/boards` | Get all boards |
| GET | `/boards/:id` | Get one board (includes members + lists) |
| PUT | `/boards/:id` | Update board name or privacy |
| DELETE | `/boards/:id` | Delete board (cascades to lists + cards) |
| POST | `/boards/:id/members` | Add a user to a board |
| DELETE | `/boards/:id/members/:userId` | Remove a user from a board |

### Board Lists

| Method | Path | Description |
|--------|------|-------------|
| POST | `/boards/:boardId/lists` | Create a list inside a board |
| GET | `/board-lists/:id` | Get one list (includes cards) |
| PUT | `/board-lists/:id` | Update list name or position |
| DELETE | `/board-lists/:id` | Delete list (cascades to cards) |

### Cards

| Method | Path | Description |
|--------|------|-------------|
| POST | `/board-lists/:listId/cards` | Create a card in a list |
| GET | `/cards/:id` | Get one card |
| PUT | `/cards/:id` | Update card name or description |
| DELETE | `/cards/:id` | Delete card |
| PATCH | `/cards/:id/assign` | Assign a board member to card |
| PATCH | `/cards/:id/unassign` | Remove assignment from card |
| PATCH | `/cards/:id/move` | Move card to a different list (same board only) |

---

## Request / Response Contracts

### POST `/api/users`
```json
// Request
{ "name": "Alice", "email": "alice@example.com" }

// Response 201
{ "id": 1, "name": "Alice", "email": "alice@example.com" }
```

### POST `/api/boards`
```json
// Request
{ "name": "My Project", "privacy": "PRIVATE" }

// Response 201
{ "id": 1, "name": "My Project", "privacy": "PRIVATE", "url": "/boards/1" }
```

### POST `/api/boards/:id/members`
```json
// Request
{ "user_id": 3 }

// Response 201
{ "board_id": 1, "user_id": 3 }
```

### POST `/api/boards/:boardId/lists`
```json
// Request
{ "name": "To Do", "position": 0 }

// Response 201
{ "id": 1, "name": "To Do", "board_id": 1, "position": 0 }
```

### POST `/api/board-lists/:listId/cards`
```json
// Request
{ "name": "Fix login bug", "description": "OAuth token not refreshing" }

// Response 201
{ "id": 1, "name": "Fix login bug", "description": "OAuth token not refreshing",
  "board_list_id": 1, "assigned_user": null, "position": 0 }
```

### PATCH `/api/cards/:id/assign`
```json
// Request
{ "user_id": 3 }

// Response 200
{ "id": 1, "name": "Fix login bug", ..., "assigned_user": 3 }
```

### PATCH `/api/cards/:id/move`
```json
// Request
{ "board_list_id": 4 }

// Response 200
{ "id": 1, "name": "Fix login bug", ..., "board_list_id": 4 }
```

---

## Implementation Steps

---

### STEP 1 — Repository & Root Setup

1. Create root folder `trello-clone/`
2. Add root `README.md` describing the project, how to run backend and frontend

---

### STEP 2 — Backend Bootstrap

1. `cd backend && npm init -y`
2. Install dependencies:
   ```bash
   npm install express pg dotenv cors
   npm install --save-dev nodemon
   ```
3. Add scripts to `package.json`:
   ```json
   "scripts": {
     "start": "node server.js",
     "dev": "nodemon server.js"
   }
   ```
4. Create `.env`:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=trello_clone
   DB_USER=postgres
   DB_PASSWORD=yourpassword
   ```
5. Create `.env.example` with the same keys but empty values.

---

### STEP 3 — Database Config

**`backend/src/config/db.js`**
```js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

module.exports = pool;
```

---

### STEP 4 — Schema + Init Script

**`backend/src/db/schema.sql`**
Write all 5 CREATE TABLE statements from the Database Design section (with `IF NOT EXISTS`).

**`backend/src/db/init.js`**
```js
const fs   = require('fs');
const path = require('path');
const pool = require('../config/db');

async function init() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('Schema initialized');
  process.exit(0);
}

init().catch(err => { console.error(err); process.exit(1); });
```

Run once with: `node src/db/init.js`

---

### STEP 5 — Express App + Error Handler

**`backend/src/middleware/errorHandler.js`**
```js
module.exports = (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
};
```

**`backend/src/app.js`**
```js
const express     = require('express');
const cors        = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users',       require('./routes/users.routes'));
app.use('/api/boards',      require('./routes/boards.routes'));
app.use('/api/board-lists', require('./routes/boardlists.routes'));
app.use('/api/cards',       require('./routes/cards.routes'));

app.use(errorHandler);

module.exports = app;
```

**`backend/server.js`**
```js
require('dotenv').config();
const app  = require('./src/app');
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
```

---

### STEP 6 — Users Resource

**Pattern:** Route → Controller → Service (repeat for every resource)

#### `routes/users.routes.js`
```js
const router     = require('express').Router();
const controller = require('../controllers/users.controller');

router.post('/',    controller.create);
router.get('/',     controller.getAll);
router.get('/:id',  controller.getOne);

module.exports = router;
```

#### `controllers/users.controller.js`
Extract req body/params, call service, send response. All wrapped in try/catch → `next(err)`.

#### `services/users.service.js`
SQL operations:
- `create({ name, email })` → `INSERT INTO users ... RETURNING *`
- `getAll()` → `SELECT * FROM users`
- `getOne(id)` → `SELECT * FROM users WHERE id = $1` → 404 if not found

**Error convention:**
```js
const err = new Error('User not found');
err.status = 404;
throw err;
```

---

### STEP 7 — Boards Resource

#### Routes
All 7 board endpoints (see API Design table).

#### Service business logic:

- **`create({ name, privacy })`**
  1. `INSERT INTO boards (name, privacy) VALUES ($1, $2) RETURNING *`
  2. `UPDATE boards SET url = '/boards/' || id WHERE id = $1 RETURNING *`

- **`getOne(id)`** — return board + members array + board_lists array (JOIN or multiple queries)

- **`addMember(boardId, userId)`**
  1. Verify board exists (404 if not)
  2. Verify user exists (404 if not)
  3. `INSERT INTO board_members ... ON CONFLICT DO NOTHING`

- **`removeMember(boardId, userId)`** → `DELETE FROM board_members WHERE board_id=$1 AND user_id=$2`

- **`delete(id)`** → `DELETE FROM boards WHERE id=$1` (cascade handles the rest)

---

### STEP 8 — Board Lists Resource

#### Routes
- `POST /api/boards/:boardId/lists` → mounted on boards router or separately
- `GET /api/board-lists/:id`
- `PUT /api/board-lists/:id`
- `DELETE /api/board-lists/:id`

#### Service business logic:

- **`create({ name, board_id, position })`** → verify board exists → INSERT
- **`getOne(id)`** → return list + all its cards (with assigned user info via JOIN)
- **`update(id, { name, position })`** → partial update, only set provided fields
- **`delete(id)`** → `DELETE FROM board_lists WHERE id=$1` (cascade removes cards)

---

### STEP 9 — Cards Resource

#### Routes
All 7 card endpoints (see API Design table).

#### Service business logic:

- **`create({ name, description, board_list_id })`** → verify list exists → INSERT (assigned_user defaults NULL)

- **`assign(cardId, userId)`**
  1. Fetch card → get `board_list_id`
  2. Fetch board_list → get `board_id`
  3. Check `board_members` — user must be in that board (422 if not)
  4. `UPDATE cards SET assigned_user = $1 WHERE id = $2 RETURNING *`

- **`unassign(cardId)`** → `UPDATE cards SET assigned_user = NULL WHERE id=$1 RETURNING *`

- **`move(cardId, targetListId)`**
  1. Fetch card → get current `board_list_id`
  2. Fetch current list → get `board_id` (source)
  3. Fetch target list → get `board_id` (target)
  4. If source `board_id` ≠ target `board_id` → throw 422 "Cannot move card across boards"
  5. `UPDATE cards SET board_list_id = $1 WHERE id = $2 RETURNING *`

---

### STEP 10 — API Documentation

Write `API_DOCUMENTATION.md` at project root covering every endpoint with:
- Method + full URL
- Request body schema
- Success response (status code + JSON example)
- Possible error responses (404, 409, 422, 500)

---

### STEP 11 — Frontend Bootstrap

```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install axios react-router-dom
```

**`vite.config.js`** — add proxy to avoid CORS in dev:
```js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
}
```

---

### STEP 12 — Frontend API Layer (`src/api/`)

Each file exports async functions wrapping `axios` calls:

**`src/api/boards.js`** example:
```js
import axios from 'axios';

const BASE = '/api/boards';

export const getAllBoards  = ()         => axios.get(BASE);
export const getBoard      = (id)       => axios.get(`${BASE}/${id}`);
export const createBoard   = (data)     => axios.post(BASE, data);
export const updateBoard   = (id, data) => axios.put(`${BASE}/${id}`, data);
export const deleteBoard   = (id)       => axios.delete(`${BASE}/${id}`);
export const addMember     = (id, data) => axios.post(`${BASE}/${id}/members`, data);
export const removeMember  = (id, uid)  => axios.delete(`${BASE}/${id}/members/${uid}`);
```

Repeat pattern for `cards.js`, `boardlists.js`, `users.js`.

---

### STEP 13 — Frontend Pages & Components

#### `src/pages/HomePage.jsx`
- Fetches all boards on mount
- Displays a grid of `<BoardCard />` components
- Has a button to open `<BoardForm />` modal for creating new boards

#### `src/pages/BoardPage.jsx`
- Route: `/boards/:id`
- Fetches board (with lists + cards) on mount
- Renders a horizontal scroll of `<BoardListColumn />` components
- Has button to add a new list

#### `src/components/Board/BoardCard.jsx`
- Shows board name, privacy badge
- Links to `/boards/:id`
- Has delete button

#### `src/components/Board/BoardForm.jsx`
- Controlled form: name + privacy select
- Calls `createBoard` or `updateBoard` on submit

#### `src/components/BoardList/BoardListColumn.jsx`
- Shows list name
- Renders list of `<CardItem />` components
- Has "Add Card" button at bottom
- Has delete list button

#### `src/components/Card/CardItem.jsx`
- Shows card name + assignee (if any)
- Clickable to open `<CardForm />` modal for editing
- Has move-to-list dropdown

#### `src/components/Card/CardForm.jsx`
- Fields: name, description
- Assign/unassign user dropdown (only board members)
- Save / Delete buttons

#### `src/components/shared/`
- `Navbar.jsx` — app title + nav links
- `Modal.jsx` — reusable modal wrapper
- `Spinner.jsx` — loading indicator

---

### STEP 14 — Frontend Routing

**`src/App.jsx`**
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar   from './components/shared/Navbar';
import HomePage from './pages/HomePage';
import BoardPage from './pages/BoardPage';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"            element={<HomePage />} />
        <Route path="/boards/:id"  element={<BoardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Error Handling Conventions

| Scenario | HTTP Status |
|----------|-------------|
| Resource not found | 404 |
| Duplicate email / member already added | 409 |
| Business rule violation (e.g. move across boards, assign non-member) | 422 |
| Missing required fields | 400 |
| Unexpected server error | 500 |

---

## Running the App

### Backend
```bash
cd backend
cp .env.example .env       # fill in DB credentials
node src/db/init.js        # create tables
npm run dev                # starts on port 3000
```

### Frontend
```bash
cd frontend
npm run dev                # starts on port 5173
```

---

## Implementation Checklist

### Backend
- [ ] `backend/` npm project initialized with dependencies
- [ ] `.env` + `.env.example`
- [ ] `src/config/db.js` — pg pool
- [ ] `src/db/schema.sql` — 5 tables with constraints
- [ ] `src/db/init.js` — schema runner
- [ ] `src/middleware/errorHandler.js`
- [ ] `src/app.js` + `server.js`
- [ ] Users — routes, controller, service (create, getAll, getOne)
- [ ] Boards — routes, controller, service (CRUD + members + url auto-set)
- [ ] Board Lists — routes, controller, service (CRUD scoped to board)
- [ ] Cards — routes, controller, service (CRUD + assign + unassign + move)
- [ ] All business rules enforced in service layer
- [ ] `API_DOCUMENTATION.md`

### Frontend
- [ ] Vite + React + TailwindCSS initialized
- [ ] Axios + React Router installed
- [ ] Vite proxy config pointing to backend
- [ ] `src/api/` layer for all 4 resources
- [ ] `HomePage` — board grid + create board
- [ ] `BoardPage` — lists + cards kanban view
- [ ] `BoardCard`, `BoardForm` components
- [ ] `BoardListColumn`, `BoardListForm` components
- [ ] `CardItem`, `CardForm` components
- [ ] `Navbar`, `Modal`, `Spinner` shared components
- [ ] React Router setup in `App.jsx`
