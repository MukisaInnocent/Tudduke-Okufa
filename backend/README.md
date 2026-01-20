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
- `GET /api/kids/memory-verses/daily` - Get today's verse
- `GET /api/kids/sermons` - Get children's sermons
- `GET /api/kids/sermons/:id` - Get specific children's sermon
- `GET /api/kids/quiz` - Get quiz questions

### Donations
- `POST /api/donations` - Submit donation
- `GET /api/donations` - Get all donations

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
- `sermons` - Daily sermons
- `weekly_lessons` - Kids weekly lessons
- `memory_verses` - Memory verses for kids
- `children_sermons` - Children's sermons
- `quiz_questions` - Bible quiz questions
- `donations` - Donation records
