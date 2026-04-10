# Recall — Adaptive Learning Platform

> Don't just review. Prove it.

Recall is an AI-powered adaptive learning web app that closes the knowledge gap through a flashcard → quiz → gap analysis feedback loop.

## Architecture

```
Browser (React/Vite)
    │
    │  /api/*  (HTTP)
    ▼
Express Server  ──►  OpenRouter API  ──►  LLM (Gemini Flash)
    │
  server/.env    ← API key lives HERE ONLY, never on the client
```

**The OpenRouter API key is stored exclusively on the server.** It is never sent to or accessible by the browser.

## Getting Started

### Prerequisites
- Node.js 18+
- An OpenRouter API key → https://openrouter.ai/keys

### 1. Clone & install
```bash
git clone <repo>
cd recall
npm install
```

### 2. Configure the server
```bash
# Copy the template:
cp server/.env server/.env.local   # (or just edit server/.env directly)

# Set your API key:
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### 3. Run in development
```bash
npm run dev
# Starts Express API on :3001 and Vite on :5173 concurrently
```

### 4. Build & run in production
```bash
npm run build        # Builds frontend into /dist
npm start            # Express serves both API + static frontend
```

---

## Project Structure

```
recall/
├── src/                    # React frontend
│   ├── services/llm.js     # Calls /api/* (NO secrets here)
│   ├── hooks/useLibrary.js # localStorage persistence
│   └── App.jsx             # All UI views
├── server/
│   ├── index.js            # Express API proxy
│   └── .env                # 🔒 API key — never commit this
├── vite.config.js          # Dev proxy: /api → :3001
└── package.json
```

## Environment Variables (server/.env)

| Variable | Description |
|---|---|
| `OPENROUTER_API_KEY` | **Required.** Your OpenRouter API key |
| `LLM_MODEL` | Model to use (default: `google/gemini-2.0-flash-001`) |
| `PORT` | Server port (default: `3001`) |
| `FRONTEND_URL` | Your production domain (for CORS) |
| `NODE_ENV` | Set to `production` in prod |

## Security Notes

- API key is a **server-only** environment variable — zero client exposure
- Basic in-memory rate limiting (10 req/min per IP) — swap for Redis in production
- Input validation on all API endpoints (type, length, structure)
- CORS restricted to known origins in production
