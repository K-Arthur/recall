// Recall Backend API Server
// Proxies all LLM requests to OpenRouter — API key never reaches the client.

/* global process */
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

config(); // Load .env

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = process.env.LLM_MODEL || 'google/gemini-2.0-flash-001';

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }));

// In dev: allow Vite dev server. In production: same origin only.
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL || 'http://localhost:4173']
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, server-to-server) only in dev
    if (!origin && process.env.NODE_ENV !== 'production') return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST'],
}));

// ── LLM Helper ────────────────────────────────────────────────────────────────
async function callOpenRouter(systemPrompt, userMessage, res, operationName = 'LLM Call') {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error(`[❌ ERROR] [${new Date().toISOString()}] [${operationName}] No API key configured. Aborting.`);
    return res.status(503).json({ error: 'LLM service is not configured. Please contact the administrator.' });
  }

  console.log(`[▶️ START] [${new Date().toISOString()}] [${operationName}] Routing prompt to model: ${MODEL}...`);
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const upstream = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5174',
        'X-Title': 'Recall - Adaptive Learning Platform',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
      }),
    });
    
    clearTimeout(timeoutId);

    if (!upstream.ok) {
      const errBody = await upstream.json().catch(() => ({}));
      const msg = errBody?.error?.message || `Upstream API error: ${upstream.status}`;
      console.error(`[❌ ERROR] [${new Date().toISOString()}] [${operationName}] Upstream returned ${upstream.status} - Details: ${msg}`);
      return res.status(502).json({ error: msg });
    }

    const data = await upstream.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error(`[❌ ERROR] [${new Date().toISOString()}] [${operationName}] Empty response received from OpenRouter.`);
      return res.status(502).json({ error: 'Empty response from LLM.' });
    }

    try {
      const parsed = JSON.parse(content);
      const duration = Date.now() - startTime;
      console.log(`[✅ SUCCESS] [${new Date().toISOString()}] [${operationName}] Request fulfilled in ${duration}ms!`);
      return res.json(parsed);
    } catch (parseErr) {
      console.error(`[❌ ERROR] [${new Date().toISOString()}] [${operationName}] LLM returned invalid JSON. Content dump:`, content);
      return res.status(502).json({ error: 'The AI generated an invalid response mapped format. Please reconsider the topic length or retry.' });
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.error(`[🚨 FATAL] [${new Date().toISOString()}] [${operationName}] Timeout of 60s exceeded.`);
      return res.status(504).json({ error: 'The upstream LLM provider timed out. The server might be overloaded.' });
    }
    console.error(`[🚨 FATAL] [${new Date().toISOString()}] [${operationName}] Catch block triggered:`, err.message);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
}

// ── Prompts ───────────────────────────────────────────────────────────────────
const FLASHCARD_SYSTEM_PROMPT = `You are an expert educator specializing in structured knowledge distillation.
Given a topic or raw study notes, generate a set of 6 to 10 concise, high-quality flashcards.
Rules:
- Each card tests exactly ONE concept. No compound ideas on a single card.
- Front: a clear question or term. Back: a concise, memorable answer (1–3 sentences max).
- Ensure cards cover both breadth and depth of the topic.
- Output ONLY valid JSON with this exact structure:
{
  "topic": "...",
  "cards": [
    { "id": "1", "front": "...", "back": "..." }
  ]
}`;

const QUIZ_SYSTEM_PROMPT = `You are an expert exam creator.
Given a set of flashcards, create a multiple-choice quiz.
CRITICAL RULES:
1. ONLY test information EXPLICITLY stated in the provided flashcards. Zero hallucination.
2. Each question maps to exactly one flashcard (sourceCardId must match the card's id).
3. Provide exactly 4 answer options per question. Only one is correct.
4. Make distractors plausible but clearly wrong to an informed learner.
Output ONLY valid JSON:
{
  "quiz": [
    {
      "id": "q1",
      "sourceCardId": "...",
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswerIndex": 0
    }
  ]
}`;

const GAP_QUIZ_SYSTEM_PROMPT = `You are an expert remedial exam creator.
Given a set of "Gap Cards" (re-teaching material for missed concepts), create a multiple-choice quiz.
CRITICAL RULES:
1. ONLY test information EXPLICITLY stated in the provided gap cards. Zero hallucination.
2. Formulate the question entirely differently than the original quiz. Use the new analogies or perspectives provided in the gap cards.
3. Each question aligns with exactly one gap card (sourceCardId must match the gap card's targetCardId, which was the original missed card).
4. Provide exactly 4 answer options per question. Only one is correct. Focus distractors on common misunderstandings related to the gap card's explanation.
Output ONLY valid JSON:
{
  "quiz": [
    {
      "id": "gq1",
      "sourceCardId": "...",
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswerIndex": 0
    }
  ]
}`;

const GAP_CARD_SYSTEM_PROMPT = `You are an expert remedial educator.
A student just failed some quiz questions. Your job is to generate "Gap Cards" that re-teach the missed concepts.
Rules:
1. Re-explain each missed concept from a DIFFERENT angle — use analogies, mnemonics, or step-by-step breakdowns.
2. Do NOT just rephrase the original card. Create genuinely new perspectives.
3. Generate 1–2 gap cards per missed concept.
4. Output ONLY valid JSON:
{
  "gapCards": [
    { "id": "g1", "front": "...", "back": "...", "isGapCard": true, "targetCardId": "..." }
  ]
}`;

// ── Rate limiting (simple in-memory, replace with Redis for production) ───────
const rateMap = new Map();
// Simple cleanup to prevent runaway memory leaks
setInterval(() => rateMap.clear(), 3600000); // 1 hour
function rateLimit(ip, maxPerMin = 10) {
  const now = Date.now();
  const window = 60_000;
  const entry = rateMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > window) {
    rateMap.set(ip, { count: 1, start: now });
    return false;
  }
  if (entry.count >= maxPerMin) return true; // rate limited
  entry.count++;
  rateMap.set(ip, entry);
  return false;
}

function withRateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  if (rateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }
  next();
}

// ── Routes ────────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', model: MODEL }));

// POST /api/generate-cards
app.post('/api/generate-cards', withRateLimit, async (req, res) => {
  const { topic } = req.body;
  if (!topic || typeof topic !== 'string' || topic.trim().length < 2) {
    return res.status(400).json({ error: 'A valid topic is required.' });
  }
  if (topic.length > 5000) {
    return res.status(400).json({ error: 'Topic text is too long (max 5000 chars).' });
  }
  await callOpenRouter(FLASHCARD_SYSTEM_PROMPT, `Generate flashcards for: "${topic.trim()}"`, res, 'Generate Flashcards');
});

// POST /api/generate-quiz
app.post('/api/generate-quiz', withRateLimit, async (req, res) => {
  const { cards } = req.body;
  if (!Array.isArray(cards) || cards.length === 0) {
    return res.status(400).json({ error: 'A valid cards array is required.' });
  }
  const summary = cards
    .slice(0, 20) // cap at 20 to limit tokens
    .map(c => `[ID: ${c.id}] Front: "${c.front}" | Back: "${c.back}"`)
    .join('\n');
  await callOpenRouter(QUIZ_SYSTEM_PROMPT, `Generate a quiz from these flashcards:\n${summary}`, res, 'Generate Quiz');
});

// POST /api/generate-gap-quiz
app.post('/api/generate-gap-quiz', withRateLimit, async (req, res) => {
  const { gapCards } = req.body;
  if (!Array.isArray(gapCards) || gapCards.length === 0) {
    return res.status(400).json({ error: 'A valid gapCards array is required.' });
  }
  const summary = gapCards
    .slice(0, 15) // cap at 15 to limit tokens
    .map(c => `[Target ID: ${c.targetCardId}] Front: "${c.front}" | Back: "${c.back}"`)
    .join('\n');
  await callOpenRouter(GAP_QUIZ_SYSTEM_PROMPT, `Generate a gap quiz verifying these concepts:\n${summary}`, res, 'Generate Gap Quiz');
});

// POST /api/generate-gap-cards
app.post('/api/generate-gap-cards', withRateLimit, async (req, res) => {
  const { cards, missedCardIds } = req.body;
  if (!Array.isArray(cards) || !Array.isArray(missedCardIds) || missedCardIds.length === 0) {
    return res.status(400).json({ error: 'Valid cards and missedCardIds arrays are required.' });
  }
  const missed = cards.filter(c => missedCardIds.includes(c.id)).slice(0, 10);
  if (missed.length === 0) {
    return res.status(400).json({ error: 'None of the missedCardIds matched the provided cards.' });
  }
  const summary = missed
    .map(c => `[ID: ${c.id}] Front: "${c.front}" | Back: "${c.back}"`)
    .join('\n');
  await callOpenRouter(GAP_CARD_SYSTEM_PROMPT, `Generate gap cards for these missed concepts:\n${summary}`, res, 'Generate Gap Cards');
});

// In production: serve the built frontend
if (process.env.NODE_ENV === 'production') {
  const staticDir = join(__dirname, '../dist');
  app.use(express.static(staticDir));
  app.get('*', (_, res) => res.sendFile(join(staticDir, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`\n🧠 Recall API server running on http://localhost:${PORT}`);
  console.log(`   Model: ${MODEL}`);
  console.log(`   Env:   ${process.env.NODE_ENV || 'development'}\n`);
});
