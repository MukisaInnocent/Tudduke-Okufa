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
const { 
  sequelize, 
  ContactMessage, 
  Sermon, 
  WeeklyLesson, 
  MemoryVerse, 
  ChildrenSermon, 
  QuizQuestion, 
  Donation 
} = require('./models');

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

    // TEMP — run once, then remove alter:true
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced');
  } catch (error) {
    console.error('❌ Database error:', error);
  }
})();

/*********************************
 * API ROUTES
 *********************************/

// Contact Messages
app.post('/api/contact', async (req, res) => {
  console.log('📩 Incoming body:', req.body);

  try {
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

app.get('/api/debug/messages', async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Sermons
app.get('/api/sermons', async (req, res) => {
  try {
    const sermons = await Sermon.findAll({
      order: [['entrytime', 'DESC']],
      limit: 100
    });
    res.json(sermons);
  } catch (err) {
    console.error('❌ Sermons fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch sermons' });
  }
});

app.get('/api/sermons/:id', async (req, res) => {
  try {
    const sermon = await Sermon.findByPk(req.params.id);
    if (!sermon) {
      return res.status(404).json({ error: 'Sermon not found' });
    }
    res.json(sermon);
  } catch (err) {
    console.error('❌ Sermon fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch sermon' });
  }
});

// Weekly Lessons (Kids)
app.get('/api/kids/lessons', async (req, res) => {
  try {
    const lessons = await WeeklyLesson.findAll({
      order: [['weekNumber', 'DESC'], ['createdAt', 'DESC']]
    });
    res.json(lessons);
  } catch (err) {
    console.error('❌ Lessons fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

app.get('/api/kids/lessons/:id', async (req, res) => {
  try {
    const lesson = await WeeklyLesson.findByPk(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json(lesson);
  } catch (err) {
    console.error('❌ Lesson fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// Memory Verses (Kids)
app.get('/api/kids/memory-verses', async (req, res) => {
  try {
    const verses = await MemoryVerse.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });
    res.json(verses);
  } catch (err) {
    console.error('❌ Memory verses fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch memory verses' });
  }
});

app.get('/api/kids/memory-verses/daily', async (req, res) => {
  try {
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    let verse = await MemoryVerse.findOne({
      where: { dayOfWeek, isActive: true }
    });
    
    // If no verse for today, get a random active verse
    if (!verse) {
      const verses = await MemoryVerse.findAll({
        where: { isActive: true }
      });
      if (verses.length > 0) {
        const randomIndex = Math.floor(Math.random() * verses.length);
        verse = verses[randomIndex];
      }
    }
    
    res.json(verse || {});
  } catch (err) {
    console.error('❌ Daily verse fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch daily verse' });
  }
});

// Children Sermons (Kids)
app.get('/api/kids/sermons', async (req, res) => {
  try {
    const sermons = await ChildrenSermon.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(sermons);
  } catch (err) {
    console.error('❌ Children sermons fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch children sermons' });
  }
});

app.get('/api/kids/sermons/:id', async (req, res) => {
  try {
    const sermon = await ChildrenSermon.findByPk(req.params.id);
    if (!sermon) {
      return res.status(404).json({ error: 'Sermon not found' });
    }
    res.json(sermon);
  } catch (err) {
    console.error('❌ Children sermon fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch sermon' });
  }
});

// Quiz Questions (Kids)
app.get('/api/kids/quiz', async (req, res) => {
  try {
    const questions = await QuizQuestion.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });
    res.json(questions);
  } catch (err) {
    console.error('❌ Quiz questions fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch quiz questions' });
  }
});

// Donations
app.post('/api/donations', async (req, res) => {
  try {
    const { name, email, phone, amount, currency, paymentMethod, paymentDetails, notes } = req.body;

    if (!name || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Name, amount, and payment method are required'
      });
    }

    const donation = await Donation.create({
      name,
      email,
      phone,
      amount,
      currency: currency || 'UGX',
      paymentMethod,
      paymentDetails,
      notes,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: donation
    });
  } catch (err) {
    console.error('❌ Donation save error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to save donation'
    });
  }
});

app.get('/api/donations', async (req, res) => {
  try {
    const donations = await Donation.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    res.json(donations);
  } catch (err) {
    console.error('❌ Donations fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch donations' });
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

/*********************************
 * START SERVER
 *********************************/
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
