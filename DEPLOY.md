# Deployment Guide for Render

Your project is now configured for "Blueprint" deployment on Render. This is the easiest way to deploy as it automatically creates the Web Service and the managed Database for you.

## Prerequisite: Push to GitHub/GitLab

Since you are running locally, you must push your code to a remote repository (like GitHub) so Render can access it.

1. Create a **New Repository** on GitHub (ensure it is Private if you want to keep it secure, though Render works with both).
2. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
   *(If you already have a remote, just run `git push`)*

## Step 1: Deploy on Render

1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub/GitLab account if you haven't already.
4. Select the repository you just pushed (`Tudduke-Okufa`).
5. Render will detect the `render.yaml` file and show you the resources it will create:
   - **Service**: `tudduke-okufa-web` (Your Node.js Backend & Frontend)
   - **Database**: `tudduke-okufa-db` (PostgreSQL)
6. Click **Apply** or **Create Resources**.

## Step 2: Sit Back & Relax

- Render will:
  - Provision the database.
  - Clone your code.
  - Install dependencies (`npm install`).
  - Seed the database (`npm run seed`).
  - Start the server (`node server.js`).

## Notes

- **Database**: The configuration uses the "Free" plan for Postgres. Note that Render's free databases expire after 90 days. For long-term production, upgrade to a paid database plan (~$7/mo).
- **Environment Variables**: The Blueprint automatically generates a `JWT_SECRET` and links the database, so you don't need to manually copy your `.env` file!
- **Frontend**: Your frontend is served statically by the backend, so it will be available at the root URL (e.g., `https://tudduke-okufa-web.onrender.com/`).

## Troubleshooting

- **Logs**: If deployment fails, check the "Logs" tab in the Render dashboard.
- **Auto-Redeploy**: Every time you push to the `main` branch, Render will automatically redeploy your site.
