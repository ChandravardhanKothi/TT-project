# Setup Guide (Java + React)

This repo contains a complete **Java full-stack** app:
Spring Boot backend + React frontend (Vite).

## Prerequisites

- **JDK 17+**
- **Maven 3.9+**
- **Node.js + npm** (required to build the React frontend)
- A **Groq API key**

## Configure Groq key

Set the environment variable before starting the app:

```bash
export GROQ_API_KEY="YOUR_GROQ_API_KEY_HERE"
```

Important: do **not** include surrounding quotes in the env value.

## Build + run (recommended)

From the repo root:

### Backend

```bash
cd backend/java-app
export GROQ_API_KEY="YOUR_GROQ_API_KEY_HERE"
mvn spring-boot:run
```

Backend runs on:
`http://localhost:5001`

### Frontend

```bash
cd frontend/frontend
npm install
VITE_API_BASE_URL="http://localhost:5001" npm run dev
```

Frontend runs on:
`http://localhost:5173`

## Deploy on Render (frontend + backend as separate services)

This project uses **cookie-based sessions** (`credentials: 'include'`), so when you deploy frontend and backend on different domains you must configure **CORS** + **SameSite=None; Secure** cookies.

### Step 1: Create the backend Web Service

In Render:

- **New** → **Web Service**
- **Connect** your GitHub repo
- **Root Directory**: `backend/java-app`
- **Environment**: Java
- **Build Command**:

```bash
mvn -DskipTests package
```

- **Start Command**:

```bash
java -jar target/marketai-suite-1.0.0-SNAPSHOT.jar
```

Add these **Environment Variables**:

- `GROQ_API_KEY`: `YOUR_GROQ_API_KEY_HERE`
- `SESSION_COOKIE_SAMESITE`: `None`
- `SESSION_COOKIE_SECURE`: `true`
- `APP_CORS_ALLOWED_ORIGINS`: set this to your frontend URL after you create it, e.g. `https://marketai-frontend.onrender.com`
  - (Spring property name is `app.cors.allowed-origins`; you can provide multiple origins comma-separated.)

Deploy, then copy the backend public URL (example `https://marketai-backend.onrender.com`).

### Step 2: Create the frontend Static Site

In Render:

- **New** → **Static Site**
- **Connect** the same GitHub repo
- **Root Directory**: `frontend/frontend`
- **Build Command**:

```bash
npm ci
npm run build
```

- **Publish Directory**: `dist`

Add this **Environment Variable**:

- `VITE_API_BASE_URL`: your backend URL, e.g. `https://marketai-backend.onrender.com`

Deploy, then copy the frontend public URL.

### Step 3: Finish CORS configuration on backend

Go back to your backend service in Render and set:

- `APP_CORS_ALLOWED_ORIGINS`: the exact frontend URL, e.g. `https://marketai-frontend.onrender.com`

Redeploy backend.

### Step 4: Verify end-to-end

- Open the frontend URL
- Register a user
- Confirm the app can hit protected endpoints (dashboard/generator/chatbot) without 401s

## Troubleshooting

- If you see `Invalid API Key (401)`, confirm `GROQ_API_KEY` has no quotes/spaces.
- If you see `npm`/`node` missing, install Node.js 18+ and re-run `setup.sh`.
- If login works but subsequent requests act logged-out on Render:
  - confirm backend env `SESSION_COOKIE_SAMESITE=None` and `SESSION_COOKIE_SECURE=true`
  - confirm backend env `APP_CORS_ALLOWED_ORIGINS` exactly matches the frontend URL
  - confirm frontend env `VITE_API_BASE_URL` points to the backend URL (https)
