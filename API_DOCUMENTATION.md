# Trello Clone — API Documentation

Base URL: `https://taskboard-sigma-five.vercel.app/api`

---

## Users

### POST `/api/users` — Create a user

**Request body:**
```json
{ "name": "Alice", "email": "alice@example.com" }
```

**Success response — `201`**
```json
{ "id": 1, "name": "Alice", "email": "alice@example.com" }
```

**Error responses:**
| Status | Condition |
|--------|-----------|
| 400 | `name` or `email` missing |
| 409 | `email` already exists (unique constraint) |
| 500 | Unexpected server error |

---

### GET `/api/users` — Get all users

**Success response — `200`**
```json
[
  { "id": 1, "name": "Alice", "email": "alice@example.com" },
  { "id": 2, "name": "Bob",   "email": "bob@example.com" }
]
```

---

### GET `/api/users/:id` — Get one user

**Success response — `200`**
```json
{ "id": 1, "name": "Alice", "email": "alice@example.com" }
```

**Error responses:**
| Status | Condition |
|--------|-----------|
| 404 | User not found |
| 500 | Unexpected server error |

---

## Boards

### POST `/api/boards` — Create a board

**Request body:**
```json
{ "name": "My Project", "privacy": "PRIVATE" }
```
`privacy` defaults to `"PUBLIC"` if omitted. Allowed values: `"PUBLIC"`, `"PRIVATE"`.

**Success response — `201`**
```json
{ "id": 1, "name": "My Project", "privacy": "PRIVATE", "url": "/boards/1" }
```

**Error responses:**
| Status | Condition |
|--------|-----------|
| 400 | `name` missing |
| 500 | Unexpected server error |

---

### GET `/api/boards` — Get all boards

**Success response — `200`**
```json
[
  { "id": 1, "name": "My Project", "privacy": "PUBLIC", "url": "/boards/1" },
  { "id": 2, "name": "Personal",   "privacy": "PRIVATE", "url": "/boards/2" }
]
```

---

### GET `/api/boards/:id` — Get one board with members, lists, and cards

**Success response — `200`**
```json
{
  "id": 1,
  "name": "My Project",
  "privacy": "PUBLIC",
  "url": "/boards/1",
  "members": [
    { "id": 1, "name": "Alice", "email": "alice@example.com" },
    { "id": 3, "name": "Carol", "email": "carol@example.com" }
  ],
  "lists": [
    {
      "id": 1,
      "name": "To Do",
      "board_id": 1,
      "position": 0,
      "cards": [
        {
          "id": 1,
          "name": "Fix login bug",
          "description": "OAuth token not refreshing",
          "board_list_id": 1,
          "assigned_user": null,
          "position": 0,
          "assignees": []
        },
        {
          "id": 2,
          "name": "Write tests",
          "description": null,
          "board_list_id": 1,
          "assigned_user": 3,
          "position": 1,
          "assignees": [
            { "id": 3, "name": "Carol", "email": "carol@example.com" }
          ]
        }
      ]
    },
    {
      "id": 2,
      "name": "Done",
      "board_id": 1,
      "position": 1,
      "cards": []
    }
  ]
}
```

Cards now include an `assignees` array (instead of the previous `assigned_user_name` string). The `assigned_user` field is kept for backward compatibility.

**Error responses:**
| Status | Condition |
|--------|-----------|
| 404 | Board not found |
| 500 | Unexpected server error |

---

### PUT `/api/boards/:id` — Update board name or privacy

**Request body** (at least one field required):
```json
{ "name": "Renamed Project" }
```

**Success response — `200`**
```json
{ "id": 1, "name": "Renamed Project", "privacy": "PUBLIC", "url": "/boards/1" }
```

**Error responses:**
| Status | Condition |
|--------|-----------|
| 400 | No fields provided |
| 404 | Board not found |
| 500 | Unexpected server error |

---

### DELETE `/api/boards/:id` — Delete board (cascades to lists, cards, members, and card assignments)

**Success response — `204`** (no body)

**Error responses:**
| Status | Condition |
|--------|-----------|
| 404 | Board not found |
| 500 | Unexpected server error |

---

### POST `/api/boards/:id/members` — Add a user to a board

**Request body:**
```json
{ "user_id": 3 }
```

**Success response — `201`**
```json
{ "board_id": 1, "user_id": 3 }
```

**Error responses:**
| Status | Condition |
|--------|-----------|
| 400 | `user_id` missing |
| 404 | Board or user not found |
| 500 | Unexpected server error |

---

### DELETE `/api/boards/:id/members/:userId` — Remove a user from a board

Also removes the user from all card assignments (`card_members`) within the board.

**Success response — `204`** (no body)

**Error responses:**
| Status | Condition |
|--------|-----------|
| 404 | Membership not found (board, user, or relation missing) |
| 500 | Unexpected server error |

---

## Board Lists

### POST `/api/boards/:boardId/lists` — Create a list inside a board

**Request body:**
```json
{ "name": "To Do", "position": 0 }
```
`position` defaults to `0` if omitted.

**Success response — `201`**
```json
{ "id": 1, "name": "To Do", "board_id": 1, "position": 0 }
```

**Error responses:**
| Status | Condition |
|--------|-----------|
| 400 | `name` missing |
| 404 | Board not found |
| 500 | Unexpected server error |

---

### GET `/api/board-lists/:id` — Get one list with its cards

**Success response — `200`**
```json
{
  "id": 1,
  "name": "To Do",
  "board_id": 1,
  "position": 0,
  "cards": [
    {
      "id": 1,
      "name": "Fix login bug",
      "description": "OAuth token not refreshing",
      "board_list_id": 1,
      "assigned_user": null,
      "position": 0,
      "assignees": []
    },
    {
      "id": 2,
      "name": "Write tests",
      "description": null,
      "board_list_id": 1,
      "assigned_user": 3,
      "position": 1,
      "assignees": [
        { "id": 3, "name": "Carol", "email": "carol@example.com" }
      ]
    }
  ]
}
```

Cards now include an `assignees` array (instead of the previous `assigned_user_name` string).

**Error responses:**
| Status | Condition |
|--------|-----------|
| 404 | Board list not found |
| 500 | Unexpected server error |

---

### PUT `/api/board-lists/:id` — Update list name or position

**Request body** (at least one field required):
```json
{ "name": "In Progress", "position": 1 }
```

**Success response — `200`**
```json
{ "id": 1, "name": "In Progress", "board_id": 1, "position": 1 }
```

**Error responses:**
| Status | Condition |
|--------|-----------|
| 400 | No fields provided |
| 404 | Board list not found |
| 500 | Unexpected server error |

---

### DELETE `/api/board-lists/:id` — Delete list (cascades to its cards and their assignments)

**Success response — `204`** (no body)

**Error responses:**
| Status | Condition |
|--------|-----------|
| 404 | Board list not found |
| 500 | Unexpected server error |

---

## Cards

### POST `/api/board-lists/:listId/cards` — Create a card in a list

**Request body:**
```json
{ "name": "Fix login bug", "description": "OAuth token not refreshing", "position": 2 }
```
`description` and `position` are optional. When `position` is omitted, the card is appended at the end of the list. When `position` is provided, existing cards at `>= position` are shifted up by 1 and the new card is inserted at that index.

**Success response — `201`**
```json
{ "id": 1, "name": "Fix login bug", "description": "OAuth token not refreshing", "board_list_id": 1, "assigned_user": null, "position": 2 }
```

**Error responses:**
| Status | Condition |
|--------|-----------|
| 400 | `name` missing |
| 404 | Board list not found |
| 500 | Unexpected server error |

---

### GET `/api/cards/:id` — Get one card

**Success response — `200`**
```json
{
  "id": 1,
  "name": "Fix login bug",
  "description": "OAuth token not refreshing",
  "board_list_id": 1,
  "assigned_user": 3,
  "position": 0,
  "assignees": [
    { "id": 3, "name": "Carol", "email": "carol@example.com" }
  ]
}
```

Returns an `assignees` array of all users assigned to the card. The `assigned_user` field is kept for backward compatibility.

**Error responses:**
| Status | Condition |
|--------|-----------|
| 404 | Card not found |
| 500 | Unexpected server error |

---

### PUT `/api/cards/:id` — Update card fields

**Request body** (at least one field required):
```json
{ "name": "Fix OAuth bug", "description": "Updated description" }
```

Allowed fields: `name`, `description`, `position`, `board_list_id`.

**Success response — `200`**
```json
{ "id": 1, "name": "Fix OAuth bug", "description": "Updated description", "board_list_id": 1, "assigned_user": 3, "position": 0 }
```

Note: the response does not include `assignees` (use `GET /api/cards/:id` to fetch full data with assignees).

**Error responses:**
| Status | Condition |
|--------|-----------|
| 400 | No fields provided |
| 404 | Card not found |
| 500 | Unexpected server error |

---

### DELETE `/api/cards/:id` — Delete card (cascades to its member assignments)

**Success response — `204`** (no body)

**Error responses:**
| Status | Condition |
|--------|-----------|
| 404 | Card not found |
| 500 | Unexpected server error |

---

### PATCH `/api/cards/:id/assign` — Add a board member to a card

**Request body:**
```json
{ "user_id": 3 }
```

The user must be a member of the board that owns the card's list. This is additive — it does not replace existing assignees. Calling it again with the same user is a no-op (idempotent).

**Success response — `200`**
```json
{
  "id": 1,
  "name": "Fix login bug",
  "board_list_id": 1,
  "assigned_user": 3,
  "position": 0,
  "assignees": [
    { "id": 1, "name": "Alice", "email": "alice@example.com" },
    { "id": 3, "name": "Carol", "email": "carol@example.com" }
  ]
}
```

**Error responses:**
| Status | Condition |
|--------|-----------|
| 400 | `user_id` missing |
| 404 | Card not found |
| 422 | User is not a member of this board |
| 500 | Unexpected server error |

---

### PATCH `/api/cards/:id/unassign` — Remove a specific user from a card

**Request body:**
```json
{ "user_id": 3 }
```

Removes only the specified user from the card's assignee list. Other assignees are preserved. To remove all assignees, call this endpoint for each user, or omit `user_id` to clear all.

**Success response — `200`**
```json
{
  "id": 1,
  "name": "Fix login bug",
  "board_list_id": 1,
  "assigned_user": null,
  "position": 0,
  "assignees": [
    { "id": 1, "name": "Alice", "email": "alice@example.com" }
  ]
}
```

**Error responses:**
| Status | Condition |
|--------|-----------|
| 404 | Card not found |
| 500 | Unexpected server error |

---

### PATCH `/api/cards/:id/move` — Move card to a different list (same board only)

**Request body:**
```json
{ "board_list_id": 4 }
```

The target list must belong to the same board as the card's current list. Assignees are preserved.

**Success response — `200`**
```json
{ "id": 1, "name": "Fix login bug", "description": "OAuth token not refreshing", "board_list_id": 4, "assigned_user": 3, "position": 0 }
```

**Error responses:**
| Status | Condition |
|--------|-----------|
| 400 | `board_list_id` missing |
| 404 | Card or target list not found |
| 422 | Cannot move card across boards |
| 500 | Unexpected server error |

---

## Error Response Format

All error responses follow this shape:

```json
{ "error": "Descriptive error message" }
```

---

## Database Schema (PostgreSQL)

### Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts |
| `boards` | Kanban boards |
| `board_members` | Join table: many-to-many users ↔ boards |
| `board_lists` | Columns within a board |
| `cards` | Cards within a list |
| `card_members` | Join table: many-to-many users ↔ cards (multi-assign) |

### Key Relationships

- `boards` → `board_lists` (1:N) via `board_lists.board_id`
- `board_lists` → `cards` (1:N) via `cards.board_list_id`
- `board_members` connects `users` to `boards` (N:M)
- `card_members` connects `users` to `cards` (N:M) — enables multiple assignees per card
- The legacy `cards.assigned_user` column is preserved for backward compatibility but is no longer the source of truth
