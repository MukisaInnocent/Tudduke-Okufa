# Tudduke Okufa Backend Setup

## Prerequisites
- Node.js (>= 18)
- PostgreSQL installed and running on your PC

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database Connection

Create a `.env` file in the `backend` directory with the following:

```env
# Database Configuration
# Option 1: Use DATABASE_URL (for production/cloud)
# DATABASE_URL=postgresql://username:password@localhost:5432/tudduke_okufa

# Option 2: Use individual parameters (for local development)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tudduke_okufa
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Important:** Replace `your_postgres_password` with your actual PostgreSQL password.

### 3. Create the Database

Run the setup script to create the database:

```bash
npm run setup-db
```

This will:
- Connect to your PostgreSQL server
- Create the `tudduke_okufa` database if it doesn't exist

### 4. Seed Initial Data

Populate the database with sample data:

```bash
npm run seed
```

This will create:
- Sample sermons
- Weekly lessons for kids
- Memory verses
- Children's sermons
- Quiz questions

### 5. Start the Server

```bash
npm start
```

The server will:
- Connect to the database
- Create all necessary tables
- Start listening on port 3000 (or PORT from .env)

## API Endpoints

Once the server is running, the following endpoints are available:

### Contact
- `POST /api/contact` - Submit contact message
- `GET /api/debug/messages` - Get all contact messages

### Sermons
- `GET /api/sermons` - Get all sermons
- `GET /api/sermons/:id` - Get specific sermon

### Kids Content
- `GET /api/kids/lessons` - Get weekly lessons
- `GET /api/kids/lessons/:id` - Get specific lesson
- `GET /api/kids/memory-verses` - Get all memory verses
- `POST /api/admin/memory-verses` - Create memory verse (Admin/Teacher)
- `GET /api/kids/sermons` - Get children's sermons
- `GET /api/kids/sermons/:id` - Get specific children's sermon
- `GET /api/kids/quiz` - Get quiz questions (Optional ?topicId=...)
- `GET /api/kids/quiz/topics` - Get quiz topics
- `POST /api/teacher/quiz/topics` - Create quiz topic

### Donations
- `POST /api/donations` - Submit donation
- `GET /api/donations` - Get all donations

### Teacher/Preacher Portal (Protected)
- `GET /api/teacher/classes` - Get my classes
- `POST /api/teacher/classes` - Create class
- `GET /api/teacher/resources` - Get my resources
- `POST /api/teacher/resources` - Upload resource
- `POST /api/teacher/schedule` - Add event
- `POST /api/teacher/notify-parents` - Send notifications
- `GET /api/preacher/resources` - Get preacher resources (Admin sees all)
- `POST /api/preacher/resources` - Upload preacher resource
- `PUT /api/admin/preacher-resources/:id/verify` - Verify preacher resource

### Admin
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/:id/verify` - Verify user
- `GET /api/admin/activity` - Global activity log
- `GET /api/admin/sermons` - All sermons
- `PUT /api/admin/verify-content/:type/:id` - Approved/Reject content

### Health Check
- `GET /api/health` - Server health check

## Troubleshooting

### Database Connection Issues

1. **PostgreSQL not running:**
   - Windows: Check Services or run `net start postgresql-x64-XX`
   - Linux/Mac: `sudo service postgresql start` or `brew services start postgresql`

2. **Authentication failed:**
   - Verify your username and password in `.env`
   - Check PostgreSQL authentication settings in `pg_hba.conf`

3. **Database doesn't exist:**
   - Run `npm run setup-db` to create it
   - Or manually create: `CREATE DATABASE tudduke_okufa;`

4. **Port already in use:**
   - Change `PORT` in `.env` to a different port
   - Or stop the process using port 3000

### Frontend Connection

The frontend is configured to connect to the backend at:
- Development: `http://localhost:3000`
- Make sure CORS is enabled (already configured in server.js)

## Database Schema

The following tables will be created automatically:
- `contact_messages` - Contact form submissions
- `users` - All users (teachers, kids, preachers, admins)
- `activity_logs` - audit trail of user actions
- `sermons` - Daily sermons (Main)
- `weekly_lessons` - Kids weekly lessons
- `memory_verses` - Memory verses for kids
- `children_sermons` - Children's sermons
- `quiz_questions` - Bible quiz questions
- `quiz_topics` - Categories for quizzes
- `quiz_results` - Kids quiz scores
- `donations` - Donation records
- `sabbath_school_classes` - Classes managed by teachers
- `class_events` - Events created by teachers (independent of specific classes)
- `teacher_resources` - Files/Links shared by teachers
- `preacher_resources` - Resources uploaded by preachers (requires verification)
- `resource_views` - Tracking student views on resources
- `sermon_likes` - Likes on main sermons
- `sermon_comments` - Comments on main sermons

