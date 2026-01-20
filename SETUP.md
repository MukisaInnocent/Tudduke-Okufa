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
JWT_SECRET=supersecretkey123
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

---

## 🌐 Access & Testing Guide

### 1. 🏠 Public Pages
- **Home**: [http://localhost:3000/index.html](http://localhost:3000/index.html)
- **Sermons (Main)**: [http://localhost:3000/sermons.html](http://localhost:3000/sermons.html)
- **Kids Section**: [http://localhost:3000/kids/index.html](http://localhost:3000/kids/index.html) (Fun, animated interface)

### 2. ✝️ Preacher Dashboard (Main Sermons)
*For managing main sermons (not kids).*
- **URL**: [http://localhost:3000/preacher-dashboard.html](http://localhost:3000/preacher-dashboard.html)
- **Action**: Login -> Add/Edit/Delete Sermons.
- **Account**: You can register a new account at `kids/auth.html` (it shares the auth system).

### 3. 👩‍🏫 Kids Teacher Dashboard
*For managing children's sermons/lessons.*
- **URL**: [http://localhost:3000/kids/teacher-dashboard.html](http://localhost:3000/kids/teacher-dashboard.html)
- **Auth**: [http://localhost:3000/kids/auth.html](http://localhost:3000/kids/auth.html)
- **Features**:
  - **Register**: Sign up as a "Teacher". **Check "Subscribe"** to test subscriptions.
  - **View**: See only your own sermons.
  - **Edit**: Click the **Pencil Icon** to edit your lessons.
  - **Delete**: Remove your lessons.

### 4. � Activity & Admin Dashboard
*For monitoring system usage and users.*
- **URL**: [http://localhost:3000/activity-dashboard.html](http://localhost:3000/activity-dashboard.html)
- **Features**:
  - **Users Tab**: View all registered users and their subscription status.
  - **Activity Tab**: View real-time logs of Logins, Registrations, and Sermon creations.
  
### 5. 💰 Financial Admin
*For viewing donations.*
- **URL**: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)
- **PIN**: `1234` (Default for demo)

---

## 🛠 Troubleshooting

### Database Error "userId contains null values"
If you see this error when starting the server, run the wipe script to clean incompatible old data:
```bash
npm start # If fails
node wipe-kids-sermons.js
npm start # Retry
```

### PostgreSQL Not Running
**Windows:** `net start postgresql-x64-XX`
**Mac/Linux:** `brew services start postgresql`

## 📚 API Endpoints

- **Auth**: `/api/auth/register`, `/api/auth/login`
- **Main Sermons**: `/api/sermons` (GET/POST/PUT/DELETE)
- **Kids Sermons**: `/api/kids/sermons` (GET/POST/PUT/DELETE)
- **Admin**: `/api/admin/users`, `/api/admin/activity`
