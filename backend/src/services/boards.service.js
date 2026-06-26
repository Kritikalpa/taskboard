const pool = require('../config/db');

async function create({ name, privacy }) {
  const { rows } = await pool.query(
    `INSERT INTO boards (name, privacy) VALUES ($1, $2) RETURNING *`,
    [name, privacy || 'PUBLIC']
  );
  const board = rows[0];
  // set url after insert using the generated id
  const { rows: updated } = await pool.query(
    `UPDATE boards SET url = '/boards/' || $1 WHERE id = $1 RETURNING *`,
    [board.id]
  );
  return updated[0];
}

async function getAll() {
  const { rows } = await pool.query('SELECT * FROM boards ORDER BY id');
  return rows;
}

async function getOne(id) {
  const { rows } = await pool.query('SELECT * FROM boards WHERE id = $1', [id]);
  if (!rows[0]) {
    const err = new Error('Board not found');
    err.status = 404;
    throw err;
  }
  const board = rows[0];

  const { rows: members } = await pool.query(
    `SELECT u.id, u.name, u.email FROM board_members bm
     JOIN users u ON u.id = bm.user_id
     WHERE bm.board_id = $1`,
    [id]
  );
  board.members = members;

  const { rows: lists } = await pool.query(
    'SELECT * FROM board_lists WHERE board_id = $1 ORDER BY position',
    [id]
  );

  const allCards = [];
  for (const list of lists) {
    const { rows: cards } = await pool.query(
      `SELECT c.* FROM cards c
       WHERE c.board_list_id = $1
       ORDER BY c.position`,
      [list.id]
    );
    list.cards = cards;
    allCards.push(...cards);
  }

  // Batch fetch assignees for all cards in a single query
  const cardIds = allCards.map((c) => c.id);
  const assigneesByCard = {};
  if (cardIds.length > 0) {
    const { rows: assigneeRows } = await pool.query(
      `SELECT cm.card_id, u.id, u.name, u.email FROM card_members cm
       JOIN users u ON u.id = cm.user_id
       WHERE cm.card_id = ANY($1::int[])`,
      [cardIds]
    );
    for (const row of assigneeRows) {
      (assigneesByCard[row.card_id] ??= []).push({ id: row.id, name: row.name, email: row.email });
    }
  }
  for (const card of allCards) {
    card.assignees = assigneesByCard[card.id] || [];
  }

  board.lists = lists;

  return board;
}

async function update(id, { name, privacy }) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(name);
  }
  if (privacy !== undefined) {
    fields.push(`privacy = $${idx++}`);
    values.push(privacy);
  }

  if (fields.length === 0) {
    const err = new Error('No fields to update');
    err.status = 400;
    throw err;
  }

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE boards SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  if (!rows[0]) {
    const err = new Error('Board not found');
    err.status = 404;
    throw err;
  }
  return rows[0];
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM boards WHERE id = $1', [id]);
  if (rowCount === 0) {
    const err = new Error('Board not found');
    err.status = 404;
    throw err;
  }
}

async function addMember(boardId, userId) {
  const { rows: board } = await pool.query('SELECT id FROM boards WHERE id = $1', [boardId]);
  if (!board[0]) {
    const err = new Error('Board not found');
    err.status = 404;
    throw err;
  }

  const { rows: user } = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
  if (!user[0]) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const { rows } = await pool.query(
    'INSERT INTO board_members (board_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
    [boardId, userId]
  );
  return rows[0];
}

async function removeMember(boardId, userId) {
  // remove from board_members
  const { rowCount } = await pool.query(
    'DELETE FROM board_members WHERE board_id = $1 AND user_id = $2',
    [boardId, userId]
  );
  if (rowCount === 0) {
    const err = new Error('Membership not found');
    err.status = 404;
    throw err;
  }

  // remove from card_members for all cards in this board
  await pool.query(
    `DELETE FROM card_members
     WHERE user_id = $1
       AND card_id IN (
         SELECT c.id FROM cards c
         JOIN board_lists bl ON bl.id = c.board_list_id
         WHERE bl.board_id = $2
       )`,
    [userId, boardId]
  );
}

module.exports = { create, getAll, getOne, update, remove, addMember, removeMember };
