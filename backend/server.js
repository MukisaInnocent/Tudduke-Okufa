require('dotenv').config();
const express = require('express');
const { Sequelize } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production'
      ? { require: true, rejectUnauthorized: false }
      : false
  }
});

// Test DB connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    await sequelize.sync();
    console.log('✅ Models synced');
  } catch (error) {
    console.error('❌ Database error:', error);
  }
})();

app.use(express.json());

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // TEMP: just return data (DB comes next)
    res.status(201).json({
      success: true,
      data: { name, email, message }
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Tudduke Okufa API running 🚀' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

const cors = require('cors');
app.use(cors());
