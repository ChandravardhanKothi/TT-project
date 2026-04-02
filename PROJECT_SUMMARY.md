# Project Summary - MarketAI Suite

## ✅ What this is

A complete full-stack **Java** application (Spring Boot backend) with a **React** frontend (Vite + React Router). It provides:

- Marketing campaign generation (`/generate-campaign`)
- Sales pitch generation (`/generate-pitch`)
- Lead qualification scoring (`/score-lead`)
- AI marketing chatbot with chat history (`/chatbot/message`, `/chatbot/history`)
- Social account connection + demo analytics (`/connect_social`, `/get_social`)

Groq is used as the LLM provider.

## 📁 Project Structure

```
MarketAI Suite/
├── java-app/
│   ├── pom.xml                       # Spring Boot build
│   ├── src/main/java/...            # Controllers/services/repository
│   ├── src/main/resources/static/  # React build output + style.css
│   └── frontend/                    # React source (Vite)
├── setup.sh                          # builds React + packages Spring Boot
├── README.md
├── SETUP.md
└── marketai.db                      # SQLite database (created/used by the app)
```

## 🛠️ Tech Stack

- Backend: **Java 17 + Spring Boot 3.2**
- DB: **SQLite** (JDBC)
- Frontend: **React 18 + Vite + React Router**
- Auth: **Session cookies** via Spring `HttpSession`
- LLM: **Groq API**

## 🚀 Running

See `README.md` or `SETUP.md`.
