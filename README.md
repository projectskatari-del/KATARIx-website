# KATARIx Corporate Web Platform

A premium corporate website for **KATARIx** (Software development, App development, and Computer/Networking/Hardware service providing).

## Project Architecture
- **Frontend (Static Client)**: Hosted in the root folder. Simple, fast, and responsive HTML5/CSS3/JS with custom glassmorphic styles. Designed to deploy to **Netlify**.
- **Backend (API Server)**: Hosted in the `/server` directory. Built using Node.js Express. Designed to deploy to **Render.com**.
- **Database (PostgreSQL)**: Serviced via serverless database hosting on **Neon.tech**.

---

## Local Setup & Development

### 1. Database Configuration (Neon)
1. Register a free account at [Neon.Tech](https://neon.tech/).
2. Create a project named `KATARIx`.
3. In the Neon dashboard, copy your **PostgreSQL connection string** (under Connection Details, select `node-postgres`).
   - Example: `postgres://alex:abcd1234@ep-cool-water-123456.us-east-2.aws.neon.tech/neondb?sslmode=require`

### 2. Run Backend Server Locally
1. Navigate to the `/server` folder in your terminal.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `/server` folder and copy the contents of `.env.example`.
4. Paste your Neon PostgreSQL connection string into the `DATABASE_URL` field.
5. Choose or keep the `ADMIN_PASSCODE` (default is `KatariX_Secured_2026`).
6. Start the server in development mode:
   ```bash
   npm run dev
   ```
   *The console should output: `Successfully connected to Neon PostgreSQL Database.`*

### 3. Run Frontend Locally
1. Simply double-click `index.html` to open it in your browser, or run a local web server extension (e.g., Live Server in VS Code) in the root directory.
2. Go to the **Contact** page and submit a test inquiry.
3. Go to the **Admin** (`admin.html`) page, enter the passcode you specified, and verify you can see your submission in real-time.

---

## Deployment Guide (To Cloud Hostings)

### 1. Database (Neon)
- Already set up! No extra steps needed since Neon is cloud-native and serverless.

### 2. Backend (Render.com)
1. Push your project to a GitHub repository.
2. Log into [Render.com](https://render.com/) and click **New > Web Service**.
3. Link your GitHub repository.
4. Set the following settings:
   - **Name**: `katarix-backend`
   - **Root Directory**: `server` (This tells Render to look inside the `/server` folder)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Go to **Environment** in the Render service settings and add these Environment Variables:
   - `DATABASE_URL` = *[Your Neon database connection string]*
   - `ADMIN_PASSCODE` = *[Your secret passcode]*
6. Click **Deploy Web Service**. Once deployed, copy your Render web service URL (e.g., `https://katarix-backend.onrender.com`).

### 3. Frontend (Netlify)
1. Log into [Netlify.com](https://www.netlify.com/).
2. Click **Add new site > Import an existing project** and connect your GitHub repository.
3. Set the following settings:
   - **Base directory**: Leave blank (root of repository)
   - **Build command**: Leave blank (no compile steps needed for static HTML)
   - **Publish directory**: Leave blank or put `.` (root directory contains index.html)
4. Click **Deploy site**.
5. *Optional:* If your Render backend URL is different from the default fallback in `app.js`, update the production URL inside `app.js` (line 7) and push the change to GitHub. Netlify will redeploy automatically!
