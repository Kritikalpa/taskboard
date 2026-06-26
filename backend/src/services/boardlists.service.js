const pool = require('../config/db');

async function create({ name, board_id, position }) {
  const { rows: board } = await pool.query('SELECT id FROM boards WHERE id = $1', [board_id]);
  if (!board[0]) {
    const err = new Error('Board not found');
    err.status = 404;
    throw err;
  }

  if (position == null) {
    const { rows: countRows } = await pool.query(
      'SELECT COUNT(*)::int AS count FROM board_lists WHERE board_id = $1',
      [board_id]
    );
    position = countRows[0]?.count ?? 0;
  }

  const { rows } = await pool.query(
    'INSERT INTO board_lists (name, board_id, position) VALUES ($1, $2, $3) RETURNING *',
    [name, board_id, position]
  );
  return rows[0];
}

async function getOne(id) {
  const { rows } = await pool.query('SELECT * FROM board_lists WHERE id = $1', [id]);
  if (!rows[0]) {
    const err = new Error('Board list not found');
    err.status = 404;
    throw err;
  }
  const list = rows[0];

  const { rows: cards } = await pool.query(
    `SELECT c.* FROM cards c
     WHERE c.board_list_id = $1
     ORDER BY c.position`,
    [id]
  );
  // Batch fetch assignees for all cards in a single query
  const cardIds = cards.map((c) => c.id);
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
  for (const card of cards) {
    card.assignees = assigneesByCard[card.id] || [];
  }
  list.cards = cards;

  return list;
}

async function update(id, { name, position }) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(name);
  }
  if (position !== undefined) {
    fields.push(`position = $${idx++}`);
    values.push(position);
  }

  if (fields.length === 0) {
    const err = new Error('No fields to update');
    err.status = 400;
    throw err;
  }

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE board_lists SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  if (!rows[0]) {
    const err = new Error('Board list not found');
    err.status = 404;
    throw err;
  }
  return rows[0];
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM board_lists WHERE id = $1', [id]);
  if (rowCount === 0) {
    const err = new Error('Board list not found');
    err.status = 404;
    throw err;
  }
}

module.exports = { create, getOne, update, remove };
