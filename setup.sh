#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
JAVA_DIR="$ROOT/backend/java-app"
FRONTEND_DIR="$ROOT/frontend/frontend"

echo "MarketAI Suite — Java setup"
echo "==========================="

if ! command -v java >/dev/null 2>&1; then
  echo "ERROR: Java is not installed. Install JDK 17 or newer (e.g. Temurin 17)."
  exit 1
fi

JAVA_VER="$(java -version 2>&1 | head -1)"
echo "Found: $JAVA_VER"

if ! command -v mvn >/dev/null 2>&1; then
  echo "ERROR: Maven is not installed. Install Apache Maven 3.9+."
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is not installed. Install Node 18+ (for React build)."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is not installed. Install Node.js (it includes npm)."
  exit 1
fi

if [[ ! -f "$JAVA_DIR/.env" && -f "$JAVA_DIR/.env.example" ]]; then
echo "Tip: copy backend/java-app/.env.example to backend/java-app/.env and set GROQ_API_KEY, or export GROQ_API_KEY in your shell."
fi

echo "Building React frontend ($FRONTEND_DIR) ..."
cd "$FRONTEND_DIR"
npm install
npm run build

echo "Building Java app ($JAVA_DIR) ..."
cd "$JAVA_DIR"
mvn -DskipTests package

echo ""
echo "Build finished."
echo "Run the app:"
echo "  cd \"$JAVA_DIR\""
echo "  export GROQ_API_KEY=\"your_key\"   # required"
echo "  mvn spring-boot:run"
echo ""
echo "Then open http://localhost:5001"
echo "Register a new user (passwords use BCrypt; if you keep an older marketai.db, re-register may be required)."
