# Quick Setup Guide - Tudduke Okufa

## 🚀 Quick Start (5 Steps)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Database Connection

**Option A: Interactive Setup (Recommended)**
```bash
npm run create-env
```
This will prompt you for database credentials.

**Option B: Manual Setup**
Create a `.env` file in the `backend` folder:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tudduke_okufa
DB_USER=postgres
DB_PASSWORD=your_postgres_password
PORT=3000
NODE_ENV=development
```

### Step 3: Create the Database
```bash
npm run setup-db
```

### Step 4: Seed Initial Data
```bash
npm run seed
```

### Step 5: Start the Server
```bash
npm start
```

The server will start on `http://localhost:3000`

## ✅ Verify Setup

Test the database connection:
```bash
npm run test-connection
```

## 🌐 Access the Application

Once the server is running:
- **Homepage**: http://localhost:3000/index.html
- **Sermons**: http://localhost:3000/sermons.html
- **Videos**: http://localhost:3000/videos.html
- **Donate**: http://localhost:3000/donate.html
- **Kids Section**: http://localhost:3000/kids/index.html

## 📝 Troubleshooting

### PostgreSQL Not Running
**Windows:**
- Open Services (Win+R → services.msc)
- Find PostgreSQL service and start it
- Or run: `net start postgresql-x64-XX` (replace XX with version)

**Linux/Mac:**
```bash
sudo service postgresql start
# or
brew services start postgresql
```

### Database Connection Failed
1. Verify PostgreSQL is running
2. Check `.env` file has correct credentials
3. Test connection: `npm run test-connection`
4. Create database: `npm run setup-db`

### Port Already in Use
Change `PORT` in `.env` to a different port (e.g., 3001)

## 📚 API Endpoints

All API endpoints are prefixed with `/api`:
- `GET /api/health` - Health check
- `GET /api/sermons` - Get sermons
- `GET /api/kids/lessons` - Get weekly lessons
- `GET /api/kids/memory-verses` - Get memory verses
- `GET /api/kids/quiz` - Get quiz questions
- `POST /api/contact` - Submit contact form
- `POST /api/donations` - Submit donation

## 🎯 Next Steps

1. ✅ Database is connected
2. ✅ Backend is running
3. ✅ Frontend pages are connected to backend
4. ✅ Sample data is loaded

You're all set! The application is ready to use.
