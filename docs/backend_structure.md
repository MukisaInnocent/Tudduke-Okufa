# Backend Project Structure

This document outlines the current structure of the backend server.

## Root Directory (`backend/`)

| File | Description |
| :--- | :--- |
| **server.js** | **Main Entry Point**. Configures Express app, connects to Database, defines Middleware, and contains **ALL API Routes**. |
| **seed.js** | Populates the database with initial test data (admin user, sermons, events, class). |
| **setup-db.js** | Utility to force sync/reset the database schema. |
| **create-env.js** | Helper script to generate the `.env` configuration file. |
| **package.json** | Lists dependencies (express, sequelize, pg, cors, etc.) and scripts (`npm start`). |
| **.env** | Environment variables (Database credentials, JWT Secret). |

## Database Models (`backend/models/`)

These files define the database tables using Sequelize.

| Model | Description |
| :--- | :--- |
| **index.js** | **Model Aggregator**. Initializes Sequelize, imports all models, and defines **Associations** (Relationships like One-To-Many). |
| **User.js** | Users table (Admins, Teachers, Parents, Kids). Handles roles and auth. |
| **SabbathSchoolClass.js** | Classes (e.g., "Small", "Middle"). Linked to a Teacher. |
| **ClassEvent.js** | Events created by teachers. **PK: `id`**. |
| **TeacherResource.js** | Files uploaded by teachers. Links to file system (`uploads/teacher-resources`). |
| **Sermon.js** | Sermons posted by admins. |
| **Donation.js** | Records of donations. |
| **ActivityLog.js** | Logs user actions (login, uploads, etc.). |
| **ContactMessage.js** | Messages from the "Contact Us" form. |
| **ResourceView.js** | Tracks which kids view which resources. |
| **QuizResult.js** | Stores quiz scores for kids. |
| **ChildrenSermon.js** | Specific content for children's sermons. |
| **MemoryVerse.js** | Weekly memory verses. |
| **WeeklyLesson.js** | Structured lessons for the week. |

## Utility Scripts (`backend/scripts/`)

Helper scripts for testing and debugging.

| Script | Purpose |
| :--- | :--- |
| **test-upload.js** | Tests file upload functionality. |
| **test-permission.js** | Verifies that unauthorized users cannot upload files. |
| **test-isolation.js** | Verifies that teachers can only see their own files. |
| **test-schema.js** | Verifies database constraints (e.g., One Event Per Class). |
| **force-sync.js** | Forces a database table drop/recreate to apply schema changes. |
| **check-events.js** | Inspects event data integrity. |
| **debug-users-roles.js** | Lists all users and their roles for debugging permissions. |

## API Routes Overview (in `server.js`)

-   **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/profile`
-   **Teacher**:
    -   `/api/teacher/classes` (Get my classes)
    -   `/api/teacher/resources` (Upload/List resources)
    -   `/api/teacher/schedule` (Create/List events)
    -   `/api/teacher/notify-parents` (Send notifications)
-   **Admin**: `/api/admin/sermons`, `/api/admin/verify-content/:type/:id`
-   **Kids**: `/api/kids/schedule` (Public/Approved events)
-   **Public**: `/api/sermons`, `/api/contact`
