# Trello Clone — Design Document

## Stack Overview

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend framework | React 19 + Vite | Fast HMR, modern JSX transform, small bundle |
| Styling | Tailwind CSS | Utility-first, no context-switching to CSS files |
| Animation | framer-motion | Declarative layout animations, AnimatePresence for modals |
| Drag & drop | @dnd-kit | Modular, accessible, handles sortable lists and overlays well |
| State management | useReducer + Context | Simple, no external deps; good fit for a board-shaped state tree |
| Backend | Express.js | Minimal, well-understood, easy to iterate on |
| Database | PostgreSQL | Relational model fits board→list→card hierarchy naturally |
| HTTP client | axios | Interceptors, request cancellation, clean API surface |

---

## Architecture Decisions

### 1. Optimistic Drag-and-Drop Updates

**Decision:** All DnD state mutations happen in `onDragEnd`, not `onDragOver`. A snapshot of the list/card tree is captured in `onDragStart` for rollback on API failure.

**Why:** Early versions dispatched `MOVE_CARD` in `onDragOver`, which caused React to re-render the card in a different list mid-drag. This shifted `@dnd-kit`'s droppable layout while the pointer was still moving, triggering cascading `onDragOver` events that created an infinite render loop.

**Tradeoff:** The card does not visually leave its source list until the user drops it. The `DragOverlay` provides visual feedback instead. This is slightly less "live" than Trello's native app, but avoids the render-loop crash entirely.

### 2. Multi-Assign via Join Table

**Decision:** A `card_members` join table (`card_id, user_id`) replaces the single `cards.assigned_user` column as the source of truth.

**Why:** A join table is the standard relational way to model M:N relationships. It allows querying "all cards assigned to user X" with a simple JOIN, enforces referential integrity via foreign keys, and avoids the complexity of PostgreSQL array columns or JSON fields.

**Tradeoff:** The join table adds a small amount of extra code to assemble assignees after the main card query, but a batched fetch (`WHERE cm.card_id = ANY($1::int[])`) avoids the N+1 problem and keeps the query count constant regardless of how many cards a board has.

### 3. useReducer + Context Over External State Libraries

**Decision:** Board state is managed by `useReducer` inside a `BoardProvider` context, scoped per board page via `<BoardProvider key={boardId}>`.

**Why:** The board state tree has a single shape (`{ board, lists }`) with well-defined transitions (add list, move card, delete card, etc.). A reducer makes these transitions explicit and testable without bringing in Redux or Zustand. The `key={boardId}` pattern ensures a fresh state tree when navigating between boards.

**Tradeoff:** The reducer is monolithic (167 lines, 15 action types). It lives in a single file and is hard to split without middleware. Actions like `MOVE_CARD` have complex nested array logic that would benefit from Immer or a state machine. For a project this size it's fine, but at ~20+ actions the file becomes unwieldy.

### 4. Raw SQL Queries Over an ORM

**Decision:** All database operations use raw parameterized SQL via `pg`.

**Why:** The schema is simple (6 tables, straightforward relationships). Raw SQL gives full control over query plans, makes JOINs and subqueries explicit, and avoids the impedance mismatch of an ORM. Parameterized queries prevent SQL injection without an ORM's abstraction layer.

**Tradeoff:** No migration tooling — schema changes are applied by re-running the SQL file. No query builder means more verbose code for dynamic updates (the `fields.push(...)` pattern in `update` functions). An ORM like Knex or Drizzle would reduce boilerplate at the cost of another dependency and abstraction layer.

### 5. No Authentication or Authorization

**Decision:** The API has no auth middleware. Any client can create boards, add members, and modify cards.

**Why:** This is a local-development prototyping project. Adding auth would require user sessions, JWT tokens, or OAuth — none of which add value to validating the core Kanban interaction model.

**Tradeoff:** The app cannot be deployed publicly without adding auth. The `assign` endpoint checks board membership (a user must be a board member to be assigned to a card), which is a lightweight authorization rule embedded in the service layer. True auth would need this pattern consistently across all endpoints.

---

## Data Flow

### Read Path

```
BoardPage mounts
  → GET /api/boards/:id
    → service.getOne()
      → SELECT board
      → SELECT board_members + JOIN users
      → SELECT board_lists ORDER BY position
      → for each list: SELECT cards ORDER BY position
        → for each card: SELECT card_members + JOIN users
  → dispatch SET_BOARD
  → BoardContext re-renders all children
```

### Write Path (Drag-and-Drop Card Move)

```
onDragStart
  → snapshot state.lists to prevStateRef
  → setActiveCard (for DragOverlay)

onDragOver (fires on pointer move)
  → setDragOverListId (visual highlight only)
  → no state mutations

onDragEnd (fires on drop)
  → compute activeListId vs overListId
  → if same list: dispatch REORDER_CARDS, then PUT /api/cards/:id for each card
  → if different list: dispatch MOVE_CARD, then PUT /api/cards/:id for each card in both lists
  → on API failure: rollback to prevStateRef via SET_BOARD
```

---

## Frontend Component Tree

```
BoardPage
  └─ BoardProvider (key=boardId)
      └─ BoardShell
          ├─ Board Header (title, privacy badge, member avatars, menu)
          ├─ DndContext
          │   ├─ SortableContext (horizontal — lists)
          │   │   └─ SortableListColumn × N
          │   │       └─ ListColumn (useDroppable for card drops)
          │   │           ├─ ListHeader (title, menu; dragHandle on <h3>)
          │   │           ├─ SortableContext (vertical — cards)
          │   │           │   └─ SortableCard × N
          │   │           │       └─ CardItem (name, description icon, assignee avatars)
          │   │           └─ CardAddForm / Add Card button
          │   └─ DragOverlay
          │       └─ CardGhost (scaled-up card while dragging)
          ├─ BoardForm (edit board modal)
          ├─ BoardMemberPanel (slide-out panel)
          ├─ ConfirmDialog (delete board)
          └─ CardModal (view/edit card details)
```

---

## Tradeoffs Summary

| Decision | Pros | Cons |
|----------|------|------|
| Optimistic DnD in onDragEnd | No render loops, clean state | Card doesn't move in source list until drop |
| card_members join table | Proper M:N, queryable, FK constraints | N+1 query for assignees per board load |
| useReducer + Context | Zero-dependency, explicit transitions | Monolithic reducer, hard to split |
| Raw SQL | Full control, no ORM overhead | Verbose dynamic queries, no migration tooling |
| No auth | Fast to prototype | Cannot deploy publicly |

---

## What Could Be Better

### 1. Batch Assignee Loading

The N+1 assignee query in `boards.service.getOne` is the biggest performance issue. Fix: fetch assignees for all cards in a single query:

```sql
SELECT cm.card_id, u.id, u.name, u.email
FROM card_members cm
JOIN users u ON u.id = cm.user_id
WHERE cm.card_id = ANY($1)
```
Then assemble the `assignees` arrays in JavaScript by grouping on `card_id`.

### 2. WebSocket / Real-Time Sync

Currently, changes made in one tab are invisible in another tab until a hard refresh. Adding WebSocket push (or Server-Sent Events) would let the board page subscribe to changes and apply them without polling. Each mutation endpoint would emit an event after the database write.

### 3. Persisted Board List Order Between Sessions

The home page boards are ordered by `id` (creation order). The `boards` table has no `position` column, so the user cannot reorder boards on the home page and have that order persist. Adding a `position` column (matching `board_lists.position`) and a drag-to-reorder on the home page grid would complete the Kanban UX.

### 4. State Machine for Drag Lifecycle

The `onDragStart` / `onDragOver` / `onDragEnd` handlers are inline functions with imperative logic scattered across ~100 lines. Extracting the drag lifecycle into a custom hook (`useBoardDrag`) would make the handlers testable in isolation and keep `BoardShell` focused on rendering.

### 5. Database Migrations

The current approach (re-running `schema.sql` on every deploy) is fine for prototyping but dangerous for any shared database. Using a migration tool like `node-pg-migrate` or `dbmate` would give versioned, repeatable schema changes with up/down migrations for the `card_members` table and the `assigned_user` column deprecation.

### 6. Soft Deletes for Boards and Lists

Boards and lists are hard-deleted (cascade). A `deleted_at` timestamp column would allow undo/trash functionality and prevent accidental data loss. The tradeoff is that every query would need a `WHERE deleted_at IS NULL` filter, and cascade behavior would need to be handled in application code rather than at the DB level.

### 7. Keyboard Shortcuts and Accessibility

The app relies entirely on mouse/touch for drag-and-drop. Adding keyboard reordering (via `aria-roledescription="sortable"` and arrow key handlers) would make the board usable without a pointer. `@dnd-kit` supports keyboard sensors, but wiring them up for both lists and cards requires careful focus management.

### 8. Loading Skeletons and Error Boundaries

The current loading state is a shimmer placeholder for the initial fetch, but individual mutations (add card, move list, etc.) have no loading indicator. Adding a per-operation loading state and error boundaries around the DndContext would prevent a single failed API call from taking down the entire board.
