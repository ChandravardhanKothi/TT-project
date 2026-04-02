# MarketAI Suite

AI-powered marketing and sales assistant: campaign generation, pitch writing, lead scoring, marketing chatbot, and social analytics UI.

## Stack (Java)

- **JDK 17+**, **Maven 3.9+**
- **Spring Boot 3.2** (Web, JDBC)
- **SQLite** (`marketai.db` in the process working directory)
- **Groq** API (`llama-3.3-70b-versatile`)
- **Frontend**: React SPA (Vite + React Router)

## Quick start

1. **Prerequisites**: JDK 17+, Maven, Node.js (for React build), and a [Groq](https://console.groq.com/) API key.

2. **Setup and build** (from repository root):

   ```bash
   cd backend/java-app
   mvn -DskipTests compile
   ```

3. **Run** (must set `GROQ_API_KEY`):

   ```bash
   export GROQ_API_KEY="your_key_here"
   mvn spring-boot:run
   ```

4. Start the frontend (in a new terminal):

   ```bash
   cd frontend/frontend
   npm install
   VITE_API_BASE_URL="http://localhost:5001" npm run dev
   ```

5. Open **http://localhost:5173** — register, then use the dashboard, generator, chatbot, and social pages.

### Environment

| Variable        | Required | Description |
|----------------|----------|-------------|
| `GROQ_API_KEY` | Yes      | Groq API key. Also configurable as `groq.api-key` in `application.properties`. |

The server listens on port **5001** by default (`server.port` in `java-app/src/main/resources/application.properties`).

## Project layout

| Path | Purpose |
|------|---------|
| `backend/java-app/` | Spring Boot backend API. |
| `frontend/frontend/` | React frontend (Vite). |

## API routes (used by React)

Auth:
- `POST /api/login`, `POST /api/register`, `POST /api/logout`
- `GET /api/session`, `GET /api/dashboard`

AI generation:
- `POST /generate-campaign`, `POST /generate-pitch`, `POST /score-lead`

Social:
- `POST /connect_social`, `GET /get_social`

Chatbot:
- `POST /chatbot/message`, `GET /chatbot/history`

Analytics (optional):
- `GET /api/analytics`

## Database and auth notes

- SQLite file **`marketai.db`** is created when the app starts (schema: `users`, `generations`, `social_accounts`, `chats`).
- Passwords are stored with **BCrypt**. If you already have a `marketai.db` from an older run, you may need to re-register users for login to work.

## Social analytics

The Java app uses **demo-style simulated metrics** so the UI works out-of-the-box.

## Development

```bash
cd backend/java-app
mvn -DskipTests compile    # compile only
mvn -DskipTests package    # build jar in target/
java -jar target/marketai-suite-1.0.0-SNAPSHOT.jar
```

Ensure `GROQ_API_KEY` is set in the environment when starting the JAR.
