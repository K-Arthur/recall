# Recall — Adaptive Learning Platform

> Don't just review. Prove it.

Recall is an AI-powered adaptive learning web app that closes the knowledge gap through a flashcard → quiz → gap analysis feedback loop.

## Architecture

```
Browser (React/Vite)
    │
    │  /api/*  (HTTP)
    ▼
Vercel / Express  ──►  OpenRouter API  ──►  LLM (Gemini Flash)
    │
  Secrets  ← API key lives in Vercel Dashboard or server/.env
```

**The OpenRouter API key is stored exclusively on the server.** It is never sent to or accessible by the browser.

---

## Getting Started

### Prerequisites
- Node.js 18+
- An OpenRouter API key → https://openrouter.ai/keys

### 1. Clone & install
```bash
git clone <repo-url>
cd recall
npm install
```

### 2. Configure Environment Variables

This project uses environment variables for both the frontend and backend.

- **Root (`.env`)**: Configure `VITE_API_BASE_URL` (usually `/api`).
- **Server (`server/.env`)**: Configure your `OPENROUTER_API_KEY` and model settings.

```bash
# Copy templates to create your local env files
cp .env.example .env
cp server/.env.example server/.env
```

*Note: The `.env` files are ignored by git to keep your secrets safe.*

### 3. Run in development
```bash
npm run dev
# Starts Express API on :3001 and Vite on :5173 concurrently
```

### 4. Build & Production Run (Local)
```bash
npm run build        # Builds frontend into /dist
npm start            # Express serves both API + static frontend
```

---

## Deployment to Vercel

This project is optimized for deployment on [Vercel](https://vercel.com).

1. **Push your code** to a GitHub/GitLab/Bitbucket repository.
2. **Import Project** into Vercel.
3. **Configure Environment Variables** in the Vercel Dashboard:
   - `OPENROUTER_API_KEY`: Your secret key.
   - `LLM_MODEL`: `google/gemini-2.0-flash-001` (recommended).
   - `FRONTEND_URL`: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`).
   - `NODE_ENV`: `production`.
4. **Deploy**: Vercel will automatically use the `vercel.json` configuration to set up the frontend and the serverless backend.

---

## Project Structure

```
recall/
├── src/                    # React frontend (Vite)
├── server/
│   ├── index.js            # Express API (Serverless Handler)
│   └── .env.example        # Template for backend secrets
├── vercel.json             # Vercel routing & build config
├── .env.example            # Template for frontend config
├── vite.config.js          # Dev proxy: /api → :3001
└── package.json
```

## Security Profiles

- **Zero Client Exposure**: API keys are restricted to the server-side environment.
- **Vercel Serverless**: The Express app is exported as a handler for Vercel's serverless runtime.
- **Robust `.gitignore`**: Pre-configured to prevent accidental leaks of local development configurations and secrets.
- **Rate Limiting**: Built-in simple rate limiting to prevent API abuse.
