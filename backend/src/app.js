const express     = require('express');
const cors        = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'https://taskboard-sigma-five.vercel.app', 'https://taskboard-9sjx.vercel.app'],
  credentials: true,
}));

app.use(express.json());

app.use('/api/users',       require('./routes/users.routes'));
app.use('/api/boards',      require('./routes/boards.routes'));
app.use('/api/board-lists', require('./routes/boardlists.routes'));
app.use('/api/cards',       require('./routes/cards.routes'));

app.use(errorHandler);

module.exports = app;
