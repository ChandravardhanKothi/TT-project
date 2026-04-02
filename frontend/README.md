## Frontend (Render Static Site)

This folder is for **deployment on Render** as a static site.

### Source location

Frontend source lives in `../frontend/frontend/`.

### Render settings

- **Root Directory**: `frontend/frontend`
- **Environment**: `Static Site`
- **Build Command**:

```bash
npm ci
npm run build
```

- **Publish Directory**: `dist`

### Required environment variables (Render)

- `VITE_API_BASE_URL`: your backend base URL, e.g. `https://your-backend.onrender.com`

### Notes

- The app uses cookie-based sessions; backend must allow credentials + CORS for the frontend origin.

