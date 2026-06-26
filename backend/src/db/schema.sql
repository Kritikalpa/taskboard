-- 1. users
CREATE TABLE IF NOT EXISTS users (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(100)  NOT NULL,
  email VARCHAR(255)  NOT NULL UNIQUE
);

-- 6. card_members  (join table: many users <-> many cards)
CREATE TABLE IF NOT EXISTS card_members (
  card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  PRIMARY KEY (card_id, user_id)
);

-- migrate existing single assigned_user to card_members
INSERT INTO card_members (card_id, user_id)
SELECT id, assigned_user FROM cards WHERE assigned_user IS NOT NULL
ON CONFLICT DO NOTHING;

-- 2. boards
CREATE TABLE IF NOT EXISTS boards (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(255) NOT NULL,
  privacy  VARCHAR(10)  NOT NULL DEFAULT 'PUBLIC'
             CHECK (privacy IN ('PUBLIC', 'PRIVATE')),
  url      VARCHAR(255) UNIQUE
);

-- 3. board_members  (join table: many users <-> many boards)
CREATE TABLE IF NOT EXISTS board_members (
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id  INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  PRIMARY KEY (board_id, user_id)
);

-- 4. board_lists
CREATE TABLE IF NOT EXISTS board_lists (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(255) NOT NULL,
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0
);

-- 5. cards
CREATE TABLE IF NOT EXISTS cards (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  board_list_id INTEGER REFERENCES board_lists(id) ON DELETE CASCADE,
  assigned_user INTEGER REFERENCES users(id) ON DELETE SET NULL,
  position      INTEGER NOT NULL DEFAULT 0
);
