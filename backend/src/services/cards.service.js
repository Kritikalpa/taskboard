const pool = require('../config/db');

async function create({ name, description, board_list_id, position }) {
  const { rows: list } = await pool.query('SELECT id FROM board_lists WHERE id = $1', [board_list_id]);
  if (!list[0]) {
    const err = new Error('Board list not found');
    err.status = 404;
    throw err;
  }

  if (position == null) {
    const { rows: countRows } = await pool.query(
      'SELECT COUNT(*)::int AS count FROM cards WHERE board_list_id = $1',
      [board_list_id]
    );
    position = countRows[0]?.count ?? 0;
  } else {
    await pool.query(
      'UPDATE cards SET position = position + 1 WHERE board_list_id = $1 AND position >= $2',
      [board_list_id, position]
    );
  }

  const { rows } = await pool.query(
    'INSERT INTO cards (name, description, board_list_id, position) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, description || null, board_list_id, position]
  );
  return rows[0];
}

async function getOne(id) {
  const { rows } = await pool.query(
    `SELECT c.* FROM cards c WHERE c.id = $1`,
    [id]
  );
  if (!rows[0]) {
    const err = new Error('Card not found');
    err.status = 404;
    throw err;
  }
  const card = rows[0];
  const { rows: assignees } = await pool.query(
    `SELECT u.id, u.name, u.email FROM card_members cm
     JOIN users u ON u.id = cm.user_id
     WHERE cm.card_id = $1`,
    [id]
  );
  card.assignees = assignees;
  return card;
}

async function update(id, { name, description, position, board_list_id }) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(name);
  }
  if (description !== undefined) {
    fields.push(`description = $${idx++}`);
    values.push(description);
  }
  if (position !== undefined) {
    fields.push(`position = $${idx++}`);
    values.push(position);
  }
  if (board_list_id !== undefined) {
    fields.push(`board_list_id = $${idx++}`);
    values.push(board_list_id);
  }

  if (fields.length === 0) {
    const err = new Error('No fields to update');
    err.status = 400;
    throw err;
  }

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE cards SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  if (!rows[0]) {
    const err = new Error('Card not found');
    err.status = 404;
    throw err;
  }
  return rows[0];
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM cards WHERE id = $1', [id]);
  if (rowCount === 0) {
    const err = new Error('Card not found');
    err.status = 404;
    throw err;
  }
}

async function assign(cardId, userId) {
  const { rows: card } = await pool.query('SELECT board_list_id FROM cards WHERE id = $1', [cardId]);
  if (!card[0]) {
    const err = new Error('Card not found');
    err.status = 404;
    throw err;
  }

  // get the board_id from the list
  const { rows: list } = await pool.query('SELECT board_id FROM board_lists WHERE id = $1', [card[0].board_list_id]);
  if (!list[0]) {
    const err = new Error('Board list not found');
    err.status = 404;
    throw err;
  }

  // check user is a member of the board
  const { rows: member } = await pool.query(
    'SELECT 1 FROM board_members WHERE board_id = $1 AND user_id = $2',
    [list[0].board_id, userId]
  );
  if (!member[0]) {
    const err = new Error('User is not a member of this board');
    err.status = 422;
    throw err;
  }

  await pool.query(
    'INSERT INTO card_members (card_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [cardId, userId]
  );

  return getOne(cardId);
}

async function unassign(cardId, userId) {
  if (userId) {
    await pool.query(
      'DELETE FROM card_members WHERE card_id = $1 AND user_id = $2',
      [cardId, userId]
    );
  } else {
    await pool.query(
      'DELETE FROM card_members WHERE card_id = $1',
      [cardId]
    );
  }
  return getOne(cardId);
}

async function move(cardId, targetListId) {
  // get the card's current board_list_id
  const { rows: card } = await pool.query('SELECT board_list_id FROM cards WHERE id = $1', [cardId]);
  if (!card[0]) {
    const err = new Error('Card not found');
    err.status = 404;
    throw err;
  }

  // get source board
  const { rows: sourceList } = await pool.query('SELECT board_id FROM board_lists WHERE id = $1', [card[0].board_list_id]);
  if (!sourceList[0]) {
    const err = new Error('Source board list not found');
    err.status = 404;
    throw err;
  }

  // get target board
  const { rows: targetList } = await pool.query('SELECT board_id FROM board_lists WHERE id = $1', [targetListId]);
  if (!targetList[0]) {
    const err = new Error('Target board list not found');
    err.status = 404;
    throw err;
  }

  // ensure same board
  if (sourceList[0].board_id !== targetList[0].board_id) {
    const err = new Error('Cannot move card across boards');
    err.status = 422;
    throw err;
  }

  const { rows: updated } = await pool.query(
    'UPDATE cards SET board_list_id = $1 WHERE id = $2 RETURNING *',
    [targetListId, cardId]
  );
  return updated[0];
}

module.exports = { create, getOne, update, remove, assign, unassign, move };
