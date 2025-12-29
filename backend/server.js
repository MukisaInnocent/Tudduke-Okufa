// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to Render PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Root route for testing
app.get('/', (req, res) => {
  res.send('Hello from Tudduke Backend!');
});

// Example API route
app.get('/api/sermons', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sermons');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Use Render’s provided PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));