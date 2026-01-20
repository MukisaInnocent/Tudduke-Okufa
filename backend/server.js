/*********************************
 * ENV & CORE IMPORTS
 *********************************/
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");

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
  Donation,
  User,
  ActivityLog
} = require('./models');

/*********************************
 * APP INIT
 *********************************/
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity in this setup
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT || 3000;

// Attach io to req for use in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

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

    req.io.emit('contact_message', savedMessage); // Real-time notify

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
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123'; // In prod, use .env

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

/* ===== AUTH ROUTES ===== */

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (Role default to 'kid' if not specified)
    // We allow 'teacher' and 'preacher' roles for the Ministry Portal.
    let userRole = 'kid';
    if (role === 'teacher') userRole = 'teacher';
    if (role === 'preacher') userRole = 'preacher';
    if (role === 'admin') userRole = 'admin';

    const user = await User.create({
      fullname,
      email,
      password: hashedPassword,
      roles: userRole,
      isSubscribed: req.body.isSubscribed || false
    });

    await ActivityLog.create({
      userId: user.userid,
      action: 'REGISTER',
      details: `New user: ${user.fullname} (${userRole})`,
      ipAddress: req.ip
    });

    // Real-time events
    req.io.emit('user_registered', {
      userid: user.userid,
      fullname: user.fullname,
      email: user.email,
      roles: user.roles,
      isSubscribed: user.isSubscribed,
      registerdate: user.createdAt
    });

    req.io.emit('activity_log', {
      createdAt: new Date(),
      action: 'REGISTER',
      userId: user.userid,
      details: `New user: ${user.fullname} (${userRole})`
    });

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

    // Generate Token
    const token = jwt.sign(
      { userid: user.userid, fullname: user.fullname, role: user.roles },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Async Log
    // Async Log
    ActivityLog.create({
      userId: user.userid,
      action: 'LOGIN',
      ipAddress: req.ip
    }).then(log => {
      req.io.emit('activity_log', log);
    }).catch(console.error);

    res.json({ success: true, token, user: { userid: user.userid, fullname: user.fullname, role: user.roles } });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

/* ===== PROTECTED SERMON ROUTES ===== */

// Add Children Sermon (Protected)
app.post('/api/kids/sermons', authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher') return res.sendStatus(403);

  try {
    const { title, description, videoUrl, teacherName } = req.body;
    const sermon = await ChildrenSermon.create({
      title,
      description,
      videoUrl,
      teacherName,
      userId: req.user.userid
    });

    req.io.emit('kids_sermon_update', { action: 'create', sermon });

    res.status(201).json({ success: true, data: sermon });
  } catch (err) {
    console.error('Add Sermon Error:', err);
    res.status(500).json({ error: 'Failed to add sermon' });
  }
});

// GET Children Sermons (Public or Protected? Public for viewing, but dashboard uses it too)
app.get('/api/kids/sermons', async (req, res) => {
  try {
    // Check if filtering by "mine"
    const whereClause = {};
    if (req.query.mine === 'true') {
      // We need user token here, but this route is currently public for fetching.
      // So we have to handle auth manually effectively or make a separate route.
      // Easiest is to check auth header manually if query param exists.
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token) {
        try {
          const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';
          const user = jwt.verify(token, JWT_SECRET);
          whereClause.userId = user.userid;
        } catch (e) {
          // ignore or return error
        }
      }
    }

    const sermons = await ChildrenSermon.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    res.json(sermons);
  } catch (err) {
    console.error('Fetch Kids Sermons Error:', err);
    res.status(500).json({ error: 'Failed to fetch sermons' });
  }
});

// Update Children Sermon (Protected)
app.put('/api/kids/sermons/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher') return res.sendStatus(403);

  try {
    const { title, description, videoUrl, teacherName } = req.body;
    const sermon = await ChildrenSermon.findByPk(req.params.id);

    if (!sermon) return res.status(404).json({ error: 'Sermon not found' });

    // Verify ownership
    if (sermon.userId !== req.user.userid) {
      return res.status(403).json({ error: 'You can only edit your own sermons' });
    }

    await sermon.update({
      title,
      description,
      videoUrl,
      teacherName
    });

    req.io.emit('kids_sermon_update', { action: 'update', sermon });

    res.json({ success: true, data: sermon });
  } catch (err) {
    console.error('Update Kids Sermon Error:', err);
    res.status(500).json({ error: 'Failed to update sermon' });
  }
});

// Delete Sermon (Protected)
app.delete('/api/kids/sermons/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher') return res.sendStatus(403);

  try {
    const sermon = await ChildrenSermon.findByPk(req.params.id);
    if (!sermon) return res.status(404).json({ error: 'Sermon not found' });

    // Verify ownership
    if (sermon.userId !== req.user.userid) {
      return res.status(403).json({ error: 'You can only delete your own sermons' });
    }

    await sermon.destroy();
    req.io.emit('kids_sermon_update', { action: 'delete', id: req.params.id });
    res.json({ success: true, message: 'Sermon deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete sermon' });
  }
});
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

// Create Main Sermon (Protected)
app.post('/api/sermons', authenticateToken, async (req, res) => {
  // Ideally check if user is admin/preacher/teacher
  try {
    const { topic, title, scripture, explanation, examples } = req.body;
    const sermon = await Sermon.create({
      topic,
      title,
      scripture,
      explanation,
      examples,
      authorid: req.user.userid
    });
    req.io.emit('sermon_update', { action: 'create', sermon });
    res.status(201).json({ success: true, data: sermon });
  } catch (err) {
    console.error('Create Sermon Error:', err);
    res.status(500).json({ error: 'Failed to create sermon' });
  }
});

// Update Main Sermon (Protected)
app.put('/api/sermons/:id', authenticateToken, async (req, res) => {
  try {
    const { topic, title, scripture, explanation, examples } = req.body;
    const sermon = await Sermon.findByPk(req.params.id);

    if (!sermon) return res.status(404).json({ error: 'Sermon not found' });

    // Ownership Check
    if (sermon.authorid !== req.user.userid) {
      return res.status(403).json({ error: 'Not authorized to edit this sermon' });
    }

    await sermon.update({
      topic,
      title,
      scripture,
      explanation,
      examples
    });

    req.io.emit('sermon_update', { action: 'update', sermon });

    res.json({ success: true, data: sermon });
  } catch (err) {
    console.error('Update Sermon Error:', err);
    res.status(500).json({ error: 'Failed to update sermon' });
  }
});

// Delete Main Sermon (Protected)
app.delete('/api/sermons/:id', authenticateToken, async (req, res) => {
  try {
    const sermon = await Sermon.findByPk(req.params.id);
    if (!sermon) return res.status(404).json({ error: 'Sermon not found' });

    // Ownership Check
    if (sermon.authorid !== req.user.userid) {
      return res.status(403).json({ error: 'Not authorized to delete this sermon' });
    }

    await sermon.destroy();
    req.io.emit('sermon_update', { action: 'delete', id: req.params.id });
    res.json({ success: true, message: 'Sermon deleted' });
  } catch (err) {
    console.error('Delete Sermon Error:', err);
    res.status(500).json({ error: 'Failed to delete sermon' });
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

    req.io.emit('donation_received', donation);

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
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
