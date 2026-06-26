const pool = require('../config/db');

async function create({ name, email }) {
  const { rows } = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [name, email]
  );
  return rows[0];
}

async function getAll() {
  const { rows } = await pool.query('SELECT * FROM users');
  return rows;
}

async function getOne(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  if (!rows[0]) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return rows[0];
}

module.exports = { create, getAll, getOne };
