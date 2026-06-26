# Frontend Implementation Plan — Trello Clone
### Design Theme: Twilio-Inspired

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Folder Structure](#folder-structure)
3. [Design System](#design-system)
4. [Animation & Interaction Spec](#animation--interaction-spec)
5. [Component Breakdown](#component-breakdown)
6. [Pages](#pages)
7. [API Layer](#api-layer)
8. [State Management](#state-management)
9. [Routing](#routing)
10. [Implementation Steps](#implementation-steps)
11. [Implementation Checklist](#implementation-checklist)

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 (Vite) | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| TailwindCSS | Utility-first styling |
| `@dnd-kit/core` + `@dnd-kit/sortable` | Drag and drop (cards + lists) |
| `framer-motion` | Micro-animations, transitions |
| `react-hot-toast` | Toast notifications |
| `lucide-react` | Icon set |

### Install Command
```bash
npm create vite@latest . -- --template react
npm install react-router-dom axios tailwindcss postcss autoprefixer
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install framer-motion react-hot-toast lucide-react
npx tailwindcss init -p
```

---

## Folder Structure

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/
│   │   ├── client.js             # Axios base instance
│   │   ├── boards.js
│   │   ├── boardlists.js
│   │   ├── cards.js
│   │   └── users.js
│   ├── components/
│   │   ├── board/
│   │   │   ├── BoardGrid.jsx         # Home page grid of board cards
│   │   │   ├── BoardCard.jsx         # Single board tile
│   │   │   ├── BoardForm.jsx         # Create/edit board modal form
│   │   │   └── BoardMemberPanel.jsx  # Manage board members sidebar
│   │   ├── list/
│   │   │   ├── ListColumn.jsx        # A single kanban column
│   │   │   ├── ListHeader.jsx        # Column title + actions
│   │   │   └── AddListButton.jsx     # "+ Add another list" button/form
│   │   ├── card/
│   │   │   ├── CardItem.jsx          # Card tile inside a list
│   │   │   ├── CardModal.jsx         # Full card detail modal
│   │   │   ├── CardAddForm.jsx       # Inline "add card" form at bottom of list
│   │   │   └── CardGhost.jsx         # Drag ghost/overlay element
│   │   ├── shared/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Modal.jsx             # Reusable modal wrapper
│   │   │   ├── Spinner.jsx
│   │   │   ├── Avatar.jsx            # User initials avatar
│   │   │   ├── Badge.jsx             # Privacy badge (PUBLIC/PRIVATE)
│   │   │   └── ConfirmDialog.jsx     # Delete confirmation dialog
│   ├── pages/
│   │   ├── HomePage.jsx              # All boards
│   │   └── BoardPage.jsx             # Single board — kanban view
│   ├── hooks/
│   │   ├── useBoards.js
│   │   ├── useBoard.js
│   │   └── useCards.js
│   ├── context/
│   │   └── BoardContext.jsx          # Board-level state (lists + cards)
│   ├── utils/
│   │   └── reorder.js                # DnD reorder helpers
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── tailwind.config.js
```

---

## Design System

### Inspiration: Twilio
Twilio's design language is characterised by:
- **Deep navy/dark backgrounds** with bright red-coral accent
- **Clean sans-serif typography** (Inter or similar) with high contrast
- **Functional, purposeful UI** — no decoration for decoration's sake
- **Sharp corners with selective rounding** — not overly bubbly
- **Bright, confident CTAs** on dark surfaces

---

### Color Palette

Define all tokens in `tailwind.config.js`:

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'tw-bg-deep':    '#0D1117',   // Page background — near-black navy
        'tw-bg-surface': '#161B22',   // Card/column surfaces
        'tw-bg-raised':  '#21262D',   // Elevated elements (modals, dropdowns)
        'tw-bg-hover':   '#2D333B',   // Hover state on interactive elements

        // Brand
        'tw-red':        '#F22F46',   // Twilio signature red — primary CTA
        'tw-red-hover':  '#D41F35',   // CTA hover
        'tw-red-muted':  '#3D1A1F',   // Red tint for backgrounds

        // Text
        'tw-text-primary':   '#E6EDF3',  // Main text
        'tw-text-secondary': '#8B949E',  // Subtitles, meta
        'tw-text-muted':     '#484F58',  // Placeholder, disabled

        // Borders
        'tw-border':         '#30363D',  // Default border
        'tw-border-active':  '#F22F46',  // Focused/active border

        // Status
        'tw-green':   '#2EA043',
        'tw-yellow':  '#D29922',
        'tw-blue':    '#1F6FEB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs':  ['11px', { lineHeight: '16px', letterSpacing: '0.02em' }],
        'sm':  ['13px', { lineHeight: '20px' }],
        'base':['15px', { lineHeight: '24px' }],
        'lg':  ['17px', { lineHeight: '28px', fontWeight: '600' }],
        'xl':  ['20px', { lineHeight: '30px', fontWeight: '700' }],
        '2xl': ['26px', { lineHeight: '36px', fontWeight: '700' }],
        '3xl': ['32px', { lineHeight: '44px', fontWeight: '800' }],
      },
      borderRadius: {
        'sm':  '4px',
        'md':  '6px',
        'lg':  '8px',
        'xl':  '12px',
        'full':'9999px',
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'modal':   '0 16px 48px rgba(0,0,0,0.6)',
        'column':  '0 2px 8px rgba(0,0,0,0.3)',
        'drag':    '0 20px 60px rgba(0,0,0,0.7)',
        'red-glow':'0 0 0 3px rgba(242,47,70,0.25)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
```

---

### Typography

Import in `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

**Type Scale Usage:**
- `3xl` 800 weight → Page titles (Home: "Your Boards")
- `xl` 700 → Board name on BoardPage header
- `lg` 600 → Column (list) titles
- `base` 400 → Card titles, body text
- `sm` 400 → Meta info (member count, card count), labels
- `xs` 500 uppercase + letter-spacing → Section eyebrows, badges ("PUBLIC", "PRIVATE")

---

### Global Base Styles (`index.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body, #root {
    height: 100%;
    background-color: #0D1117;
    color: #E6EDF3;
    font-family: 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  * {
    box-sizing: border-box;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #161B22;
  }
  ::-webkit-scrollbar-thumb {
    background: #30363D;
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #484F58;
  }

  ::selection {
    background: rgba(242, 47, 70, 0.3);
  }
}

@layer components {
  /* Primary Button */
  .btn-primary {
    @apply bg-tw-red hover:bg-tw-red-hover text-white text-sm font-semibold
           px-4 py-2 rounded-md transition-all duration-150
           active:scale-[0.97] active:brightness-90;
  }

  /* Ghost Button */
  .btn-ghost {
    @apply text-tw-text-secondary hover:text-tw-text-primary hover:bg-tw-bg-hover
           text-sm font-medium px-3 py-1.5 rounded-md transition-all duration-150;
  }

  /* Danger Button */
  .btn-danger {
    @apply bg-tw-red-muted border border-tw-red text-tw-red hover:bg-tw-red hover:text-white
           text-sm font-semibold px-4 py-2 rounded-md transition-all duration-200;
  }

  /* Input */
  .input-base {
    @apply w-full bg-tw-bg-deep border border-tw-border rounded-md
           px-3 py-2 text-sm text-tw-text-primary placeholder-tw-text-muted
           focus:outline-none focus:border-tw-red focus:shadow-red-glow
           transition-all duration-150;
  }

  /* Card surface */
  .card-surface {
    @apply bg-tw-bg-surface border border-tw-border rounded-lg
           shadow-card;
  }
}
```

---

## Animation & Interaction Spec

This section defines **exactly** how every interaction looks and feels.

---

### 1. Page Load

- **Home page** board grid fades in with a staggered reveal:
  - Each `BoardCard` animates with `framer-motion` `variants`:
    ```
    hidden:  { opacity: 0, y: 16 }
    visible: { opacity: 1, y: 0 }
    transition: { duration: 0.3, ease: 'easeOut', staggerChildren: 0.06 }
    ```
  - Cards appear left-to-right, top-to-bottom with 60ms stagger between each.

- **Board page** columns slide in from left:
  ```
  hidden:  { opacity: 0, x: -20 }
  visible: { opacity: 1, x: 0 }
  transition: stagger 0.08s per column, ease-out-expo
  ```

---

### 2. Card Drag and Drop (most detailed interaction)

Uses `@dnd-kit/core` with `@dnd-kit/sortable`.

#### Picking Up a Card
- On `mousedown` hold (or `pointerdown`), after a 150ms activation delay:
  - The original card position shows a **placeholder** — a dashed-border rectangle the exact size of the card, with `bg-tw-red-muted` fill (subtle red tint), `border: 1.5px dashed #F22F46`, `border-radius: 6px`, `opacity: 0.6`.
  - The dragged card lifts with:
    ```
    transform: scale(1.04) rotate(1.5deg)
    box-shadow: 0 20px 60px rgba(0,0,0,0.7)
    opacity: 0.95
    transition: transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1)
    cursor: grabbing
    ```
  - A faint red left-border accent appears on the drag ghost card.

#### While Dragging
- The ghost card follows the cursor smoothly.
- As the ghost hovers over a valid drop zone between two cards:
  - A **red insertion line** (2px solid `#F22F46`) appears between those two cards with a fade-in animation (`opacity: 0 → 1`, `200ms ease`).
  - The cards above and below the insertion point shift apart by `8px` using `transform: translateY(-4px)` and `translateY(4px)` to create a gap — animated with `transition: transform 200ms ease-out-expo`.
- As the ghost hovers over a different list column:
  - The column border changes to `border-color: #F22F46` with `box-shadow: 0 0 0 2px rgba(242,47,70,0.3)`.

#### Dropping a Card
- On drop, the card snaps into position with a spring animation:
  ```
  transform: scale(1) rotate(0deg)
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)
  ```
- The placeholder fades out simultaneously.
- A brief "settled" pulse: the card flashes `bg-tw-bg-raised` → `bg-tw-bg-surface` over `400ms`.
- A toast notification: `"Card moved to [List Name]"` — bottom-left, dark surface, no icon, 2s duration.

#### Cancelling a Drag (Escape key or invalid drop)
- Card animates back to original position with `spring` easing.
- Placeholder disappears.

---

### 3. Hovering a Card (no drag)

- `bg-tw-bg-surface → bg-tw-bg-raised`, `transition: 150ms ease`
- A thin left border accent appears: `border-left: 2px solid #F22F46`, slides in from opacity 0 in `120ms`
- The card title color shifts: `#8B949E → #E6EDF3` in `120ms`
- Action icons (edit, delete) fade in at the top-right corner: `opacity: 0 → 1` in `150ms`

---

### 4. Adding a Card Between Two Existing Cards (Hover Insertion Zone)

When hovering between two existing card items:
- A `+` button materialises in the gap between the cards:
  - Gap opens from `0px → 32px` height using `max-height` transition (`200ms ease-out-expo`)
  - The `+` button fades in: `opacity: 0 → 1`, `scale: 0.8 → 1`, `150ms spring`
  - Button style: `bg-tw-red-muted`, `text-tw-red`, `border: 1px dashed #F22F46`, full-width, `border-radius: 4px`, `text-sm`
- Clicking it opens the inline `CardAddForm` directly in that position (not at the bottom of the list).
- Hovering away: gap closes back to `0px` in `150ms ease-in`, button fades out.

---

### 5. Adding a Card (Bottom of List)

- Default state: `"+ Add a card"` text link at bottom of each column.
  - Color: `tw-text-muted` → `tw-text-secondary` on hover.
  - Hover: a subtle background `bg-tw-bg-hover` sweeps in `150ms`.
- On click:
  - The link fades out (`opacity: 0`, `100ms`)
  - An inline form expands downward from `height: 0 → auto` using `framer-motion` `AnimatePresence` + `layoutId`:
    ```
    initial:  { height: 0, opacity: 0 }
    animate:  { height: 'auto', opacity: 1 }
    exit:     { height: 0, opacity: 0 }
    transition: { duration: 0.2, ease: 'easeOut' }
    ```
  - The form contains: `<textarea>` for card name (auto-focused, 2 rows, `input-base` style) + `"Add card"` (btn-primary) + `×` close icon.
  - Pressing `Enter` submits, `Escape` closes.
  - On submit: new card appears with `framer-motion` entry animation:
    ```
    initial:  { opacity: 0, scale: 0.95, y: -8 }
    animate:  { opacity: 1, scale: 1,    y: 0 }
    transition: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }
    ```

---

### 6. Adding a New List

- `"+ Add another list"` button at the far right of the board.
- Style: semi-transparent dark surface, `bg-tw-bg-surface/60`, `backdrop-filter: blur(8px)`, white text, same column width as list columns (~280px).
- On click:
  - Button morphs into an input form using `layoutId` shared layout animation:
    ```
    The button container expands from button height → form height
    transition: layout, 300ms spring
    ```
  - Inside: text input (auto-focused) + `"Add list"` btn-primary + `×` close icon.
- On submit: new column slides in from the right:
  ```
  initial:  { opacity: 0, x: 40, scale: 0.95 }
  animate:  { opacity: 1, x: 0,  scale: 1 }
  transition: { duration: 0.28, ease: 'easeOut' }
  ```

---

### 7. Card Modal Open/Close

- Open: modal backdrop fades in (`opacity: 0 → 1`, `200ms`), modal panel scales up from 96% → 100% + slight `y: 12 → 0` (`250ms ease-out-expo`).
- Close (× or backdrop click): panel scales down `100% → 95%` + fades out, backdrop fades out simultaneously (`180ms ease-in`).
- `AnimatePresence` manages mount/unmount so the animation plays on close.

---

### 8. Delete Confirmation

- A `ConfirmDialog` component, smaller modal (320px wide).
- The content inside shakes horizontally on open: `x: [0, -6, 6, -4, 4, 0]`, `300ms` — signals danger.
- "Delete" button pulses red border glow once: `box-shadow: 0 0 0 3px rgba(242,47,70,0.4)`, `400ms` ease-out.

---

### 9. Button States (Universal)

All interactive buttons:
- **Default**: as defined in color palette
- **Hover**: `bg` shifts one step brighter/darker, `150ms`
- **Active/pressed**: `scale: 0.97`, `brightness: 0.9`, `100ms` — tactile feel
- **Focus visible**: `box-shadow: 0 0 0 3px rgba(242,47,70,0.4)` — red glow ring, keyboard navigable
- **Disabled**: `opacity: 0.4`, `cursor: not-allowed`

---

### 10. Toast Notifications

Using `react-hot-toast` with custom styling:
```js
toast.success('Board created', {
  style: {
    background: '#21262D',
    color: '#E6EDF3',
    border: '1px solid #30363D',
    borderRadius: '6px',
    fontSize: '13px',
  },
  iconTheme: { primary: '#F22F46', secondary: '#21262D' },
  duration: 2500,
  position: 'bottom-left',
})
```

Toast types: success (green icon), error (red icon), info (blue icon). No toast for loading states — use inline spinners instead.

---

## Component Breakdown

---

### `Navbar.jsx`

**Visual:**
- Full-width, `bg-tw-bg-surface`, `border-bottom: 1px solid #30363D`, `height: 56px`
- Left: App logo (red square icon + "TaskBoard" wordmark in `Inter 700`)
- Center: Search bar (`input-base` style, `max-width: 400px`, search icon inside left)
- Right: `"+ New Board"` btn-primary, user avatar circle

**Behaviour:**
- Search bar expands on focus: `width: 200px → 400px`, `transition: 300ms ease-out-expo`
- `"+ New Board"` opens the `BoardForm` modal

---

### `BoardCard.jsx` (Home Page)

**Visual:**
- `card-surface` base, `border-radius: 8px`, `padding: 16px`, `min-height: 100px`
- Top: Board name in `lg` weight
- Bottom-left: `Badge` showing `PUBLIC` or `PRIVATE` (see Badge spec below)
- Bottom-right: member count avatars stacked (up to 3, then `+N`)
- A thin colored top-border accent: `border-top: 3px solid #F22F46`

**Hover State:**
- `bg-tw-bg-surface → bg-tw-bg-raised`, `border-color: #F22F46`, `transform: translateY(-2px)`, `box-shadow: 0 8px 24px rgba(0,0,0,0.4)` — all `200ms ease`
- Delete icon appears top-right: `opacity: 0 → 1`, `150ms`

**Click:** navigates to `/boards/:id`

---

### `Badge.jsx`

```
PUBLIC:   bg-tw-green/20  text-tw-green   "PUBLIC"
PRIVATE:  bg-tw-yellow/20 text-tw-yellow  "PRIVATE"
```
Style: `text-xs uppercase font-semibold letter-spacing: 0.08em`, `px-2 py-0.5 rounded-full`

---

### `Avatar.jsx`

- Circle, `width: 28px height: 28px`, `bg-tw-red`, `text-xs font-bold` initials
- Stacked avatars: `-margin-left: 8px`, `border: 2px solid #161B22` (surface color) to create separation
- Tooltip on hover showing full name: dark tooltip, `font-size: 12px`, appears after `300ms` delay

---

### `ListColumn.jsx`

**Visual:**
- `width: 280px`, `flex-shrink: 0`
- `bg-tw-bg-surface`, `border: 1px solid #30363D`, `border-radius: 8px`
- `max-height: calc(100vh - 120px)`, `overflow-y: auto` (scrollable card list)
- Internal padding: `12px`

**Structure:**
```
┌─────────────────────────────┐
│ [ListHeader]                │
│  Title            ··· [×]   │
├─────────────────────────────┤
│ [CardItem]                  │
│ [CardItem]                  │
│ [↑ hover insertion zone ↑]  │
│ [CardItem]                  │
├─────────────────────────────┤
│ + Add a card                │
└─────────────────────────────┘
```

**Drag-over state:** `border-color: #F22F46`, `box-shadow: 0 0 0 2px rgba(242,47,70,0.25)`, `bg` shifts slightly lighter — `150ms transition`

---

### `ListHeader.jsx`

- Column title: `text-lg font-semibold text-tw-text-primary`
- Click title to inline-edit: replaces with `<input>` pre-filled with current name, auto-selects text, saves on `blur` or `Enter`
- Right side: `···` menu icon (lucide `MoreHorizontal`) + `×` delete button
- `···` menu (dropdown): `"Rename"`, `"Delete list"` — appears below with `scale: 0.95 → 1` + `opacity: 0 → 1`, `150ms spring`

---

### `CardItem.jsx`

**Visual:**
- `bg-tw-bg-raised`, `border: 1px solid #30363D`, `border-radius: 6px`, `padding: 10px 12px`
- Card name: `text-sm text-tw-text-primary`
- If assigned: show assignee `Avatar` bottom-right
- If description: show `AlignLeft` lucide icon (gray, `14px`) bottom-left
- Left border: `2px solid transparent` — becomes `#F22F46` on hover

**Hover State (see Animation spec §3)**

**Drag Handle:** entire card is draggable. Cursor changes to `grab` on hover, `grabbing` while dragging.

---

### `CardModal.jsx`

**Visual:** centered modal, `max-width: 560px`, `bg-tw-bg-raised`, `border: 1px solid #30363D`, `border-radius: 12px`, `padding: 28px`

**Layout:**
```
┌──────────────────────────────────────────┐
│  [In Progress ↓]                    [×]  │
│                                          │
│  Card title (editable h2)                │
│                                          │
│  Description                             │
│  ┌──────────────────────────────────┐   │
│  │  textarea (expandable)           │   │
│  └──────────────────────────────────┘   │
│                                          │
│  Assigned to                             │
│  [Avatar + Name]  [Unassign ×]           │
│  — or —                                  │
│  [Assign member dropdown]                │
│                                          │
│  [Save changes]          [Delete card]   │
└──────────────────────────────────────────┘
```

**Interactions:**
- Card title: click to edit inline, `<h2>` → `<input>`, saves on blur
- Description: `<textarea>` auto-expands as user types (`rows: 3` min → grows)
- "Assign member" dropdown: lists only board members, shows their avatar + name, `input-base` style with `↓` icon
- `Save changes`: btn-primary, only active if something changed (else grayed out)
- `Delete card`: btn-danger, triggers `ConfirmDialog`
- Backdrop click closes the modal

---

### `BoardForm.jsx` (Modal)

Used for both create and edit.

**Fields:**
- Board name: `input-base`, required
- Privacy: custom styled toggle — two pill buttons `PUBLIC` / `PRIVATE` side by side, active one fills red
  ```
  [  PUBLIC  ] [  PRIVATE  ]
  Active: bg-tw-red text-white
  Inactive: bg-tw-bg-deep text-tw-text-secondary border border-tw-border
  ```
- Transition on toggle: active background slides between the two options (`200ms ease`)

**Footer:** `[Cancel]` ghost button + `[Create Board]` / `[Save Changes]` btn-primary

---

### `BoardMemberPanel.jsx`

**Trigger:** "Members" button in the board header area.

**Visual:** slides in from the right as a panel overlaid on the board (`width: 300px`, `height: 100%`, `position: fixed right-0`, `bg-tw-bg-raised`, `border-left: 1px solid #30363D`).

**Animation:**
```
initial:  { x: 300 }
animate:  { x: 0 }
exit:     { x: 300 }
transition: { duration: 0.25, ease: 'easeOut' }
```

**Content:**
- Header: "Board Members" title + close `×`
- Current members list: avatar + name + email + `Remove` button (on hover only)
- Divider
- "Add member" section: email/name input → shows matching users → click to add

---

## Pages

---

### `HomePage.jsx`

**URL:** `/`

**Layout:**
```
[Navbar]
─────────────────────────────────────────
Your Boards                    [+ New Board]
─────────────────────────────────────────
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│Board │ │Board │ │Board │ │Board │
│Card  │ │Card  │ │Card  │ │Card  │
└──────┘ └──────┘ └──────┘ └──────┘
```

- `padding: 40px 48px`
- Grid: `display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px`
- Empty state: centered illustration area with text "No boards yet. Create one to get started." + btn-primary "Create your first board"
  - Empty state illustration: simple SVG kanban icon in `tw-red-muted` bg circle

**Data fetching:** on mount, call `GET /api/boards`. Loading state: skeleton cards (3 placeholder `BoardCard` shapes with shimmer animation).

**Shimmer animation:**
```css
background: linear-gradient(90deg, #161B22 25%, #21262D 50%, #161B22 75%);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

### `BoardPage.jsx`

**URL:** `/boards/:id`

**Layout:**
```
[Navbar]
[Board header: Name | Privacy badge | Members avatars | ··· menu]
─────────────────────────────────────────────────────────────────
[Column 1] [Column 2] [Column 3]  [+ Add another list]
  [Card]     [Card]
  [Card]     [Card]
             [Card]
```

- Board header: `padding: 16px 24px`, `bg-tw-bg-surface`, `border-bottom: 1px solid #30363D`
- Board name: `text-xl font-bold` — click to edit inline
- `···` menu: dropdown with "Edit board", "Manage members", "Delete board"
- Columns area: `display: flex; flex-direction: row; gap: 12px; overflow-x: auto; padding: 20px 24px; align-items: flex-start`
- `"+ Add another list"` always pinned as the last column (not scrolled off)

**`DndContext` wraps all columns** with:
- `sensors`: PointerSensor with 150ms activation delay (prevents accidental drags on click)
- `collisionDetection`: `closestCorners`
- `onDragStart`: sets active card, shows ghost via `DragOverlay`
- `onDragOver`: handles moving card between lists (updates local state optimistically)
- `onDragEnd`: finalises the move, calls `PATCH /api/cards/:id/move`, reverts on error

**Optimistic updates:** on drag end, update local state immediately, fire API call, revert + show error toast if it fails.

---

## API Layer

### `src/api/client.js`
```js
import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor: toast on 4xx/5xx
client.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.error || 'Something went wrong';
    // toast.error(msg) — import toast here or handle in calling component
    return Promise.reject(err);
  }
);

export default client;
```

### `src/api/boards.js`
```js
import client from './client';

export const getAllBoards   = ()          => client.get('/boards');
export const getBoard       = (id)        => client.get(`/boards/${id}`);
export const createBoard    = (data)      => client.post('/boards', data);
export const updateBoard    = (id, data)  => client.put(`/boards/${id}`, data);
export const deleteBoard    = (id)        => client.delete(`/boards/${id}`);
export const addMember      = (id, data)  => client.post(`/boards/${id}/members`, data);
export const removeMember   = (id, uid)   => client.delete(`/boards/${id}/members/${uid}`);
```

### `src/api/boardlists.js`
```js
import client from './client';

export const createList  = (boardId, data) => client.post(`/boards/${boardId}/lists`, data);
export const getList     = (id)            => client.get(`/board-lists/${id}`);
export const updateList  = (id, data)      => client.put(`/board-lists/${id}`, data);
export const deleteList  = (id)            => client.delete(`/board-lists/${id}`);
```

### `src/api/cards.js`
```js
import client from './client';

export const createCard  = (listId, data) => client.post(`/board-lists/${listId}/cards`, data);
export const getCard     = (id)           => client.get(`/cards/${id}`);
export const updateCard  = (id, data)     => client.put(`/cards/${id}`, data);
export const deleteCard  = (id)           => client.delete(`/cards/${id}`);
export const assignCard  = (id, data)     => client.patch(`/cards/${id}/assign`, data);
export const unassignCard= (id)           => client.patch(`/cards/${id}/unassign`);
export const moveCard    = (id, data)     => client.patch(`/cards/${id}/move`, data);
```

### `src/api/users.js`
```js
import client from './client';

export const getAllUsers  = ()      => client.get('/users');
export const getUser     = (id)    => client.get(`/users/${id}`);
export const createUser  = (data)  => client.post('/users', data);
```

---

## State Management

No Redux. Use React context + `useState`/`useReducer` for board-level state.

### `BoardContext.jsx`

Holds the state for a single board view:
```js
{
  board: { id, name, privacy, url, members: [] },
  lists: [
    {
      id, name, position,
      cards: [ { id, name, description, assigned_user, position } ]
    }
  ],
  loading: false,
  error: null,
}
```

Actions (via `useReducer`):
- `SET_BOARD` — initial load
- `ADD_LIST` — new list appended
- `DELETE_LIST` — remove list + its cards
- `UPDATE_LIST` — rename list
- `ADD_CARD` — card added to a list
- `DELETE_CARD` — card removed
- `UPDATE_CARD` — name/description/assignee changed
- `MOVE_CARD` — card moved to different list (update both lists' card arrays)
- `ADD_MEMBER` — member added to board
- `REMOVE_MEMBER` — member removed

---

## Routing

### `App.jsx`
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar    from './components/shared/Navbar';
import HomePage  from './pages/HomePage';
import BoardPage from './pages/BoardPage';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"           element={<HomePage />} />
        <Route path="/boards/:id" element={<BoardPage />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
```

### Vite Proxy (`vite.config.js`)
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
});
```

---

## Implementation Steps

### Step 1 — Bootstrap
- `npm create vite@latest . -- --template react`
- Install all dependencies
- Set up `tailwind.config.js` with full color/font token system
- Write `index.css` with base styles + component classes
- Set up `vite.config.js` with proxy
- Set up `App.jsx` with routing + `<Toaster />`

### Step 2 — API Layer
- Create `src/api/client.js` with base URL + error interceptor
- Create `boards.js`, `boardlists.js`, `cards.js`, `users.js` API files

### Step 3 — Shared Components
- `Spinner.jsx` — animated red ring spinner
- `Modal.jsx` — reusable portal-based modal wrapper with backdrop + AnimatePresence
- `Avatar.jsx` — initials circle with tooltip
- `Badge.jsx` — PUBLIC/PRIVATE pill
- `ConfirmDialog.jsx` — danger confirmation modal with shake animation

### Step 4 — Navbar
- Logo + search bar (expanding on focus) + New Board button

### Step 5 — HomePage
- `BoardGrid.jsx` with skeleton loader + staggered entry animation
- `BoardCard.jsx` with hover state, privacy badge, member avatars
- `BoardForm.jsx` modal for create/edit board

### Step 6 — BoardContext
- `context/BoardContext.jsx` — reducer + provider + actions

### Step 7 — BoardPage Shell
- Page layout, board header with inline title edit
- `···` dropdown menu (edit, manage members, delete)
- Board member panel (slide-in from right)
- Horizontal scroll column container

### Step 8 — List Columns
- `ListColumn.jsx` — column shell, drag-over visual state
- `ListHeader.jsx` — inline rename, delete with confirm
- `AddListButton.jsx` — morphing button → form with layout animation

### Step 9 — Cards
- `CardItem.jsx` — card tile with hover state, assignee avatar, description icon
- `CardAddForm.jsx` — inline expanding form at list bottom
- Hover insertion zone between cards (`+` button materialising in gap)
- `CardModal.jsx` — full detail modal with all edit/assign/delete interactions
- `CardGhost.jsx` — styled drag ghost overlay

### Step 10 — Drag and Drop
- Wrap `BoardPage` in `DndContext`
- `SortableContext` per list column
- `useSortable` on each `CardItem`
- `DragOverlay` renders `CardGhost`
- `onDragStart`, `onDragOver`, `onDragEnd` handlers
- Optimistic state update + API call + revert on error
- Placeholder (dashed red) at drag origin
- Insertion line + column highlight during drag

### Step 11 — Polish
- All `framer-motion` entry/exit animations
- Toast notifications for all CRUD operations
- Empty states (no boards, no cards in list)
- Shimmer skeleton loaders
- Keyboard accessibility (Escape closes modals, Enter submits forms)
- `prefers-reduced-motion` media query — skip animations if user has it enabled:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
  ```

---

## Implementation Checklist

### Setup
- [ ] Vite + React initialized
- [ ] All npm packages installed
- [ ] `tailwind.config.js` with full design token system
- [ ] `index.css` with base styles + component utility classes
- [ ] Google Fonts (Inter) imported in `index.html`
- [ ] `vite.config.js` proxy to backend

### API Layer
- [ ] `api/client.js` — axios instance + error interceptor
- [ ] `api/boards.js` — all board calls
- [ ] `api/boardlists.js` — all list calls
- [ ] `api/cards.js` — all card calls
- [ ] `api/users.js` — all user calls

### Shared Components
- [ ] `Spinner.jsx`
- [ ] `Modal.jsx` — portal + backdrop + AnimatePresence
- [ ] `Avatar.jsx` — initials + tooltip
- [ ] `Badge.jsx` — PUBLIC/PRIVATE
- [ ] `ConfirmDialog.jsx` — shake animation + danger btn

### Navbar
- [ ] Logo + expanding search + New Board CTA

### Home Page
- [ ] Board grid with `auto-fill` responsive columns
- [ ] Staggered entry animation
- [ ] Skeleton shimmer loader
- [ ] Empty state
- [ ] `BoardCard.jsx` — hover lift, delete on hover, privacy badge, avatars
- [ ] `BoardForm.jsx` — create + edit, privacy toggle animation

### Board Page
- [ ] Board header — inline title edit, `···` menu, member avatars
- [ ] `BoardContext` — reducer + all actions
- [ ] Member panel — slide-in from right
- [ ] Horizontal scroll column container

### Lists
- [ ] `ListColumn.jsx` — drag-over highlight state
- [ ] `ListHeader.jsx` — inline rename + delete confirm
- [ ] `AddListButton.jsx` — morph animation

### Cards
- [ ] `CardItem.jsx` — hover state, left-border accent, icons
- [ ] `CardAddForm.jsx` — expanding inline form
- [ ] Hover insertion zone `+` button between cards
- [ ] `CardModal.jsx` — all fields + assign/unassign + delete
- [ ] `CardGhost.jsx` — drag overlay visual

### Drag and Drop
- [ ] `DndContext` with PointerSensor (150ms delay)
- [ ] `SortableContext` per column
- [ ] `useSortable` on `CardItem`
- [ ] `DragOverlay` with `CardGhost`
- [ ] Drag placeholder (dashed red) at origin
- [ ] Insertion line between cards on hover
- [ ] Column highlight on card hover-over
- [ ] Optimistic update + revert on API error
- [ ] `MOVE_CARD` context action wired to `PATCH /api/cards/:id/move`

### Polish
- [ ] All `framer-motion` entry/exit animations
- [ ] Toasts for all CRUD (success + error)
- [ ] Skeleton loaders on board page
- [ ] Empty list state ("No cards yet")
- [ ] `prefers-reduced-motion` handled
- [ ] Keyboard nav: Escape closes modals, Enter submits, Tab order correct
