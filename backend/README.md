## Backend (Render Web Service)

This folder is for **deployment on Render** as a Java (Spring Boot) web service.

### Source location

Backend source lives in `../backend/java-app/`.

### Render settings

- **Root Directory**: `backend/java-app`
- **Environment**: `Java`
- **Build Command**:

```bash
mvn -DskipTests package
```

- **Start Command**:

```bash
java -jar target/marketai-suite-1.0.0-SNAPSHOT.jar
```

### Required environment variables (Render)

- `GROQ_API_KEY`: your Groq API key
- `SESSION_COOKIE_SAMESITE`: set to `None` (because frontend is on a different domain)
- `SESSION_COOKIE_SECURE`: set to `true`
- `APP_CORS_ALLOWED_ORIGINS`: set to your Render frontend URL, e.g. `https://your-frontend.onrender.com`
  - This maps to Spring property `app.cors.allowed-origins` (comma-separated supported).

### Notes

- Render provides the port via `$PORT`; the app is configured to use it (`server.port=${PORT:5001}`).
- SQLite database file `marketai.db` will be created in the service filesystem (ephemeral). For persistence you’d need a managed DB or Render Disk.

