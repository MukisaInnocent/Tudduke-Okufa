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
  ActivityLog,
  SermonComment,
  SermonLike,
  SabbathSchoolClass,
  TeacherResource,
  ClassEvent,
  ResourceView,
  QuizResult
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
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve Static Files (Images / Videos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve Frontend (HTML/CSS/JS)
app.use(express.static(path.join(__dirname, '../')));

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
    if (err) return res.status(403).json({ error: 'Invalid or expired session. Please login again.' });
    req.user = user;
    next();
  });
};

// Multer Setup (Memory Storage for DB)
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB Limit
});

/* ===== AUTH ROUTES ===== */

// Register
app.post('/api/auth/register', upload.single('profileImage'), async (req, res) => {
  try {
    const { fullname, email, password, role, phoneNumber, guardianName, guardianPhone, isSubscribed, dateOfBirth, sex, address } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    let userRole = 'kid';
    if (role === 'teacher') userRole = 'teacher';
    if (role === 'preacher') userRole = 'preacher';
    if (role === 'admin') userRole = 'admin';

    // Verification Logic: Teachers and Preachers default to false
    const isVerified = !['teacher', 'preacher'].includes(userRole);

    // FILE HANDLING (Profile Image)
    let profileImageUrl = null;
    let profileData = null;
    let profileMimeType = null;

    if (req.file) {
      profileData = req.file.buffer;
      profileMimeType = req.file.mimetype;
      // Preliminary URL - User ID not known yet, will update after create or just assume endpoint structure
      // Actually simpler: Create user first without image, then update? Or insert all at once.
      // We'll set the URL pattern: /api/public/users/:id/profile-image
      // But we need the ID. Let's rely on the client knowing this or returning it.
      // For now, let's just save the data.
    }

    const user = await User.create({
      fullname,
      email,
      password: hashedPassword,
      roles: userRole,
      phoneNumber,
      guardianName,
      guardianPhone,
      dateOfBirth,
      sex,
      address,
      isSubscribed: isSubscribed === 'true' || isSubscribed === true,
      isVerified: isVerified,
      profileData: profileData,
      profileMimeType: profileMimeType
    });

    // Update URL now that we have ID
    if (profileData) {
      user.profileImage = `/api/public/users/${user.userid}/profile-image`;
      await user.save();
    }

    await ActivityLog.create({
      userId: user.userid,
      action: 'REGISTER',
      details: `New user: ${user.fullname} (${userRole}) - Verified: ${isVerified}`,
      ipAddress: req.ip
    });

    req.io.emit('user_registered', {
      userid: user.userid,
      fullname: user.fullname,
      email: user.email,
      roles: user.roles,
      registerdate: user.createdAt,
      isVerified
    });

    req.io.emit('activity_log', {
      createdAt: new Date(),
      action: 'REGISTER',
      userId: user.userid,
      details: `New user: ${user.fullname} (${userRole})`
    });

    // Special message for unverified teachers
    if (!isVerified) {
      return res.status(201).json({
        success: true,
        message: 'Account created! Please wait for admin verification.',
        pendingVerification: true
      });
    }

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

    // Check Verification
    if (user.isVerified === false) {
      return res.status(403).json({ error: 'Account pending admin verification.' });
    }

    const token = jwt.sign(
      { userid: user.userid, fullname: user.fullname, role: user.roles },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    ActivityLog.create({
      userId: user.userid,
      action: 'LOGIN',
      ipAddress: req.ip
    }).then(log => {
      req.io.emit('activity_log', log);
    }).catch(console.error);

    res.json({
      success: true, token, user: {
        userid: user.userid,
        fullname: user.fullname,
        role: user.roles,
        profileImage: user.profileImage
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get User Profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userid, {
      attributes: ['userid', 'fullname', 'email', 'roles', 'profileImage']
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Profile Fetch Error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
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
      where: { status: 'approved' },
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
    const sermon = await Sermon.findByPk(req.params.id, {
      include: [
        {
          model: SermonLike,
          attributes: ['userId']
        }
      ]
    });
    if (!sermon) {
      return res.status(404).json({ error: 'Sermon not found' });
    }

    // Calculate like Count
    const sermonData = sermon.toJSON();
    sermonData.likeCount = sermon.SermonLikes ? sermon.SermonLikes.length : 0;

    res.json(sermonData);
  } catch (err) {
    console.error('❌ Sermon fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch sermon' });
  }
});

// Increment View
app.post('/api/sermons/:id/view', async (req, res) => {
  try {
    const sermon = await Sermon.findByPk(req.params.id);
    if (!sermon) return res.status(404).json({ error: 'Sermon not found' });

    await sermon.increment('views');
    res.json({ success: true, views: sermon.views + 1 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error' });
  }
});

// Toggle Like
app.post('/api/sermons/:id/like', authenticateToken, async (req, res) => {
  try {
    const sermonId = req.params.id;
    const userId = req.user.userid;

    const existingLike = await SermonLike.findOne({ where: { sermonId, userId } });

    if (existingLike) {
      await existingLike.destroy();
      return res.json({ success: true, liked: false });
    } else {
      await SermonLike.create({ sermonId, userId });
      return res.json({ success: true, liked: true });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error toggling like' });
  }
});

// Get Comments
app.get('/api/sermons/:id/comments', async (req, res) => {
  try {
    const comments = await SermonComment.findAll({
      where: { sermonId: req.params.id },
      include: [{ model: User, attributes: ['fullname', 'profileImage'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(comments);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error fetching comments' });
  }
});

// Post Comment
app.post('/api/sermons/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Comment cannot be empty' });

    const comment = await SermonComment.create({
      sermonId: req.params.id,
      userId: req.user.userid,
      text
    });

    // Fetch with user details to return
    const fullComment = await SermonComment.findByPk(comment.commentid, {
      include: [{ model: User, attributes: ['fullname', 'profileImage'] }]
    });

    req.io.emit('sermon_comment', fullComment); // Real-time

    res.json({ success: true, data: fullComment });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error posting comment' });
  }
});

// Get My Sermons (Preacher Dashboard)
app.get('/api/sermons/my', authenticateToken, async (req, res) => {
  try {
    const sermons = await Sermon.findAll({
      where: { authorid: req.user.userid },
      order: [['entrytime', 'DESC']]
    });
    res.json(sermons);
  } catch (err) {
    console.error('Fetch My Sermons Error:', err);
    res.status(500).json({ error: 'Failed to fetch sermons' });
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
      authorid: req.user.userid,
      status: 'pending'
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

// Get Donations (Paginated & Filtered)
app.get('/api/donations', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const search = req.query.search || '';
    const status = req.query.status || 'all';

    const { Op } = require('sequelize');
    const whereClause = {};

    // 1. Status Filter
    if (status !== 'all') {
      whereClause.status = status;
    }

    // 2. Search Filter (Name or Email or PaymentMethod)
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { paymentMethod: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // 4. Calculate Stats (Filtered)
    const totalUGX = await Donation.sum('amount', { where: { ...whereClause, currency: 'UGX' } }) || 0;
    const totalUSD = await Donation.sum('amount', { where: { ...whereClause, currency: 'USD' } }) || 0;

    const { count, rows } = await Donation.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: limit,
      offset: offset
    });

    res.json({
      success: true,
      data: rows,
      total: count,
      stats: {
        totalUGX,
        totalUSD
      },
      page: page,
      totalPages: Math.ceil(count / limit)
    });

  } catch (err) {
    console.error('❌ Donations fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// Update Donation Status (Admin)
app.put('/api/donations/:id/status', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);

  try {
    const { status } = req.body;
    const donation = await Donation.findByPk(req.params.id);

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    donation.status = status;
    await donation.save();

    res.json({ success: true, data: donation });
  } catch (err) {
    console.error('❌ Donation Update Error:', err);
    res.status(500).json({ error: 'Failed to update donation status' });
  }
});

app.get('/api/admin/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);

  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['registerdate', 'DESC']]
    });
    res.json(users);
  } catch (err) {
    console.error('Fetch Users Error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/admin/activity', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);

  try {
    const logs = await ActivityLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    res.json(logs);
  } catch (err) {
    console.error('Fetch Activity Error:', err);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Verify User (Admin)
app.put('/api/admin/users/:id/verify', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isVerified = true;
    await user.save();

    req.io.emit('user_verified', { userid: user.userid, isVerified: true });

    res.json({ success: true, message: 'User verified successfully' });
  } catch (err) {
    console.error('Verify User Error:', err);
    res.status(500).json({ error: 'Failed to verify user' });
  }
});

/* ===== TEACHER PORTAL ROUTES ===== */



// GET MY CLASSES (For a teacher) with Engagement Data
app.get('/api/teacher/classes', authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') return res.sendStatus(403);

  try {
    // 1. Find the class(es) this teacher owns
    const classes = await SabbathSchoolClass.findAll({
      where: { teacherId: req.user.userid },
      include: [
        {
          model: User,
          as: 'students',
          attributes: ['userid', 'fullname', 'dateOfBirth', 'guardianName', 'guardianPhone', 'sex'],
          include: [
            {
              model: ResourceView,
              attributes: ['resourceType', 'viewedAt'],
              limit: 5, // Show last 5 interactions
              order: [['viewedAt', 'DESC']]
            }
          ]
        }
      ]
    });

    res.json(classes);
  } catch (err) {
    console.error('Fetch Classes Error:', err);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// CREATE CLASS (Teacher/Admin)
app.post('/api/teacher/classes', authenticateToken, async (req, res) => {
  // ... same as before
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') return res.sendStatus(403);

  try {
    const { name, ageGroup } = req.body;
    const newClass = await SabbathSchoolClass.create({
      name,
      ageGroup,
      teacherId: req.user.userid
    });
    res.status(201).json(newClass);
  } catch (err) {
    console.error('Create Class Error:', err);
    res.status(500).json({ error: 'Failed to create class' });
  }
});

// TRACK RESOURCE VIEW
app.post('/api/resources/view', authenticateToken, async (req, res) => {
  try {
    const { resourceId, resourceType } = req.body;
    await ResourceView.create({
      userId: req.user.userid,
      resourceId: resourceId || null,
      resourceType: resourceType || 'unknown'
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Track View Error:', err);
    res.status(500).json({ error: 'Failed to track view' });
  }
});

// GET DASHBOARD STATS (TEACHER)
app.get('/api/teacher/dashboard/stats', authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') return res.sendStatus(403);

  try {
    const { Op } = require('sequelize');
    const today = new Date();

    // 1. Students Accessing Content (Distinct students who viewed resources)
    const activeStudentsCount = await ResourceView.count({
      distinct: true,
      col: 'userId'
    });

    // 2. Upcoming Classes / Events
    const upcomingEventsCount = await ClassEvent.count({
      where: {
        createdBy: req.user.userid,
        eventDate: { [Op.gte]: today }
      }
    });

    // 3. Resources Shared by Me
    const resourcesSharedCount = await TeacherResource.count({
      where: { uploadedBy: req.user.userid }
    });

    // 4. Graph Data: Views per day (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Note: SQLite/Postgres specific date truncation might vary. 
    // For universal compatibility in this simplified environment, we fetch recent views and group in JS.
    const recentViews = await ResourceView.findAll({
      where: {
        viewedAt: { [Op.gte]: sevenDaysAgo }
      },
      attributes: ['viewedAt']
    });

    // Process for Graph
    const viewsByDate = {};
    recentViews.forEach(v => {
      const dateStr = new Date(v.viewedAt).toLocaleDateString('en-US'); // e.g. 1/23/2025
      viewsByDate[dateStr] = (viewsByDate[dateStr] || 0) + 1;
    });

    res.json({
      activeStudents: activeStudentsCount,
      upcomingClasses: upcomingEventsCount,
      resourcesShared: resourcesSharedCount,
      graphData: viewsByDate
    });

  } catch (err) {
    console.error('Dashboard Stats Error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET TEACHER RESOURCES (Updated for Verification)
app.get('/api/teacher/resources', authenticateToken, async (req, res) => {
  // Teachers/Admins see all for management
  if (req.user.role === 'teacher' || req.user.role === 'admin') {
    try {
      const whereClause = req.user.role === 'admin' ? {} : { uploadedBy: req.user.userid };
      const resources = await TeacherResource.findAll({
        where: whereClause,
        include: [{ model: User, as: 'uploader', attributes: ['fullname', 'email'] }],
        order: [['createdAt', 'DESC']]
      });
      res.json(resources);
    } catch (err) {
      console.error('Fetch Resources Error:', err);
      res.status(500).json({ error: 'Failed to fetch resources' });
    }
    return;
  }

  // Kids/Others see ONLY APPROVED
  // Note: Kids might hit a different endpoint or reuse this if accessible
  // Assuming kids might reuse this route or a similar one. 
  // If this route is protected by `authenticateToken`, kids can access it if their token works.
  // But strict role check was above. Let's make it more flexible:
});

// GET PUBLIC/KIDS RESOURCES (Approved Only)
app.get('/api/kids/resources', authenticateToken, async (req, res) => {
  try {
    const resources = await TeacherResource.findAll({
      where: { status: 'approved' },
      order: [['createdAt', 'DESC']]
    });
    res.json(resources);
  } catch (err) {
    console.error('Fetch Kids Resources Error:', err);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// SUBMIT QUIZ RESULT
app.post('/api/kids/quiz/submit', authenticateToken, async (req, res) => {
  try {
    const { score, total } = req.body;
    const result = await QuizResult.create({
      kidId: req.user.userid,
      score,
      total
    });

    // Log activity
    await ActivityLog.create({
      userId: req.user.userid,
      action: 'QUIZ_TAKEN',
      details: `Scored ${score}/${total}`,
      ipAddress: req.ip
    });

    res.status(201).json(result);
  } catch (err) {
    console.error('Submit Quiz Error:', err);
    res.status(500).json({ error: 'Failed to submit quiz result' });
  }
});

// GET QUIZ HISTORY (My Results)
app.get('/api/kids/quiz/history', authenticateToken, async (req, res) => {
  try {
    const results = await QuizResult.findAll({
      where: { kidId: req.user.userid },
      order: [['takenAt', 'DESC']]
    });
    res.json(results);
  } catch (err) {
    console.error('Fetch Quiz History Error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// UPLOAD RESOURCE
app.post('/api/teacher/resources', authenticateToken, upload.single('resourceFile'), async (req, res) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    console.log(`[AUTH FAIL] User ${req.user.userid} (${req.user.email}) tried to upload but has role '${req.user.role}'`);
    return res.status(403).json({ error: `Permission denied. You are a '${req.user.role}', but 'teacher' or 'admin' is required.` });
  }

  try {
    const { title, type, description } = req.body;
    console.log('[DEBUG] Upload Request:', { title, type, user: req.user.userid });
    if (req.file) console.log('[DEBUG] File received:', req.file.filename);
    else console.log('[DEBUG] No file received');

    // File Handling (File System)
    let fileUrl = '';
    let fileData = null; // No longer storing BLOB
    let mimeType = null;

    if (req.file) {
      const fs = require('fs');
      const path = require('path');

      // Ensure directory exists
      const uploadDir = path.join(__dirname, '../uploads/teacher-resources');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(req.file.originalname);
      const filename = 'resource-' + uniqueSuffix + ext;
      const filePath = path.join(uploadDir, filename);

      // Write buffer to file
      fs.writeFileSync(filePath, req.file.buffer);

      fileUrl = `/uploads/teacher-resources/${filename}`;
      mimeType = req.file.mimetype;

      console.log(`[UPLOAD] Saved file to ${filePath}`);
    } else {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const resource = await TeacherResource.create({
      title,
      type: type || 'other',
      fileUrl: fileUrl,
      description,
      uploadedBy: req.user.userid,
      status: 'pending',
      fileData: null, // Saving space
      mimeType: mimeType
    });

    res.status(201).json(resource);
  } catch (err) {
    console.error('Upload Resource Error:', err);
    res.status(500).json({ error: 'Failed to upload resource' });
  }
});

// GET SCHEDULE (Updated for Verification)
app.get('/api/teacher/schedule', authenticateToken, async (req, res) => {
  // Return all for Creator (Teacher) or Admin
  if (req.user.role === 'teacher' || req.user.role === 'admin') {
    try {
      const whereClause = req.user.role === 'admin' ? {} : { createdBy: req.user.userid };
      const events = await ClassEvent.findAll({
        where: whereClause,
        include: [{ model: User, as: 'creator', attributes: ['fullname', 'email'] }], // Assuming relation exists
        order: [['eventDate', 'ASC']]
      });
      res.json(events);
    } catch (err) {
      console.error('Fetch Schedule Error:', err);
      res.status(500).json({ error: 'Failed to fetch schedule' });
    }
    return;
  }
});

// GET PUBLIC/KIDS SCHEDULE (Approved Only)
app.get('/api/kids/schedule', authenticateToken, async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const events = await ClassEvent.findAll({
      where: {
        status: 'approved',
        eventDate: { [Op.gte]: new Date() }
      },
      order: [['eventDate', 'ASC']]
    });
    res.json(events);
  } catch (err) {
    console.error('Fetch Kids Schedule Error:', err);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// ADD EVENT
app.post('/api/teacher/schedule', authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher') return res.sendStatus(403);

  try {
    const { title, description, eventDate, classId } = req.body;

    // classId IS the eventid now (PK)
    const event = await ClassEvent.create({
      eventid: classId,
      title,
      description,
      eventDate,
      createdBy: req.user.userid
    });
    res.status(201).json(event);
  } catch (err) {
    console.error('Create Event Error:', err);
    res.status(500).json({ error: 'Failed to create event. A class can only have one event.' });
  }
});

// SEND NOTIFICATION TO PARENTS
app.post('/api/teacher/notify-parents', authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') return res.sendStatus(403);

  try {
    const { subject, message } = req.body;

    // 1. Get all students linked to this teacher
    const classes = await SabbathSchoolClass.findAll({
      where: { teacherId: req.user.userid },
      include: [{ model: User, as: 'students' }]
    });

    let guardians = new Set();
    classes.forEach(cls => {
      if (cls.students) {
        cls.students.forEach(s => {
          if (s.guardianPhone) guardians.add(s.guardianPhone);
        });
      }
    });

    const parentCount = guardians.size;
    console.log(`[NOTIFICATION] Sending to ${parentCount} parents: "${subject}" - ${message}`);

    res.json({ success: true, count: parentCount });
  } catch (err) {
    console.error('Notify Parents Error:', err);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

// ADMIN: GET ALL SERMONS (Verified & Unverified)
app.get('/api/admin/sermons', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  try {
    const sermons = await Sermon.findAll({
      include: [{ model: User, as: 'author', attributes: ['fullname', 'email'] }],
      order: [['entrytime', 'DESC']]
    });
    res.json(sermons);
  } catch (err) {
    console.error('Admin Sermon Fetch Error:', err);
    res.status(500).json({ error: 'Failed to fetch sermons' });
  }
});

// VERIFY CONTENT (ADMIN)
app.put('/api/admin/verify-content/:type/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);

  try {
    const { type, id } = req.params; // type: 'resource' or 'event'
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    let item;
    if (type === 'resource') {
      item = await TeacherResource.findByPk(id);
    } else if (type === 'event') {
      item = await ClassEvent.findByPk(id);
    } else if (type === 'sermon') {
      item = await Sermon.findByPk(id);
    } else {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    if (!item) return res.status(404).json({ error: 'Item not found' });

    item.status = status;
    await item.save();

    res.json({ success: true, item });
  } catch (err) {
    console.error('Verify Content Error:', err);
    res.status(500).json({ error: 'Failed to verify content' });
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

// SERVE FILES FROM DB (Publicly Accessible if they have the link, or add auth if strict)
app.get('/api/public/resources/:id/file', async (req, res) => {
  try {
    const resource = await TeacherResource.findByPk(req.params.id);
    if (!resource || !resource.fileData) return res.status(404).send('File not found');

    res.setHeader('Content-Type', resource.mimeType || 'application/octet-stream');
    res.send(resource.fileData);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error serving file');
  }
});

app.get('/api/public/users/:id/profile-image', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user || !user.profileData) return res.status(404).send('Image not found');

    res.setHeader('Content-Type', user.profileMimeType || 'image/jpeg');
    res.send(user.profileData);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error serving image');
  }
});

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
