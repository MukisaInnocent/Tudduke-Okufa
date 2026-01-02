/*********************************
 * ENV & CORE IMPORTS
 *********************************/
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

/*********************************
 * DATABASE & MODELS
 *********************************/
const { sequelize, ContactMessage } = require('./models');

/*********************************
 * APP INIT
 *********************************/
const app = express();
const PORT = process.env.PORT || 3000;

/*********************************
 * MIDDLEWARE (ORDER MATTERS)
 *********************************/
app.use(cors());
app.use(express.json());

/*********************************
 * DATABASE INIT
 *********************************/
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // TEMP: force table alignment (remove after first success)
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced');
  } catch (error) {
    console.error('❌ Database error:', error);
  }
})();

/*********************************
 * API ROUTES
 *********************************/
app.post('/api/contact', async (req, res) => {
  try {
    console.log('📩 Incoming body:', req.body); // DEBUG

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    const savedMessage = await ContactMessage.create({
      name,
      email,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Message saved successfully',
      data: savedMessage
    });
  } catch (err) {
    console.error('❌ Contact save error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to save message'
    });
  }
});

/*********************************
 * DEBUG ROUTE (VERY IMPORTANT)
 *********************************/
app.get('/api/debug/messages', async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

/*********************************
 * HEALTH CHECK
 *********************************/
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK 🚀' });
});

/*********************************
 * FRONTEND (STATIC FILES)
 *********************************/
app.use(express.static(path.join(__dirname, '../')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../test.html'));
});

/*********************************
 * START SERVER
 *********************************/
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
