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
