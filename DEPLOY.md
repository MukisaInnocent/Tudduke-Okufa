# Deploying to Render

Your application is configured for Render. Follow these steps to ensure a smooth deployment.

## 1. Prerequisites (On Render Dashboard)
When you create your Web Service on Render, ensure you set the following **Environment Variables**:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Optimizes the app for performance. |
| `JWT_SECRET` | *(Generate a random string)* | Used to secure user sessions. |
| `DATABASE_URL` | *(Internal Connection URL)* | Automatically set if you link a Render Postgres DB. |

## 2. Database Setup
You **MUST** use a PostgreSQL database.
1.  Create a **PostgreSQL** database on Render.
2.  Link it to your Web Service.
3.  Render will automatically inject `DATABASE_URL`.

> **Warning**: Do NOT use SQLite (local file) on Render. Your data will disappear every time the server restarts. The current code is already configured to detect and use PostgreSQL (`pg`) when available.

## 3. File Storage
We have migrated file storage to the database to ensure compatibility with Render.
-   **Limits**: Uploads are limited to **50MB** per file to prevent crashing the server.
-   **Storage**: Files are stored in the database `BLOB` columns.

## 4. Verification After Deployment
Once deployed, check the **Logs** tab in Render:
1.  Look for: `✅ Database connected`
2.  Look for: `✅ Models synced`

If you see these, your app is live and connected!
