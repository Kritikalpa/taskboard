require('dotenv').config();
const app = require('./src/app');

// Vercel serverless export
module.exports = app;

// Local dev
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server on port ${PORT}`));
}
