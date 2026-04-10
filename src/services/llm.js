// Frontend LLM Service
// ─────────────────────────────────────────────────────────────────────────────
// All requests go to our own backend API. The OpenRouter API key lives
// exclusively on the server and is NEVER exposed to the client.

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function post(endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }

  return data;
}

// ─── Phase 1: Generate Flashcards ────────────────────────────────────────────
export async function generateFlashcards(topicOrNotes) {
  const result = await post('/generate-cards', { topic: topicOrNotes });

  const cards = (result.cards || []).map((c, i) => ({
    id: c.id || String(i + 1),
    front: c.front,
    back: c.back,
    isGapCard: false,
  }));

  return { topic: result.topic || topicOrNotes, cards };
}

// ─── Phase 2: Generate Quiz ───────────────────────────────────────────────────
export async function generateQuiz(cards) {
  const result = await post('/generate-quiz', { cards });

  return (result.quiz || []).map((q, i) => ({
    id: q.id || `q${i + 1}`,
    sourceCardId: q.sourceCardId,
    question: q.question,
    options: q.options,
    correctAnswerIndex: q.correctAnswerIndex,
  }));
}

// ─── Phase 4: Generate Gap Quiz (Re-Test) ───────────────────────────────────
export async function generateGapQuiz(gapCards) {
  const result = await post('/generate-gap-quiz', { gapCards });

  return (result.quiz || []).map((q, i) => ({
    id: q.id || `gq${i + 1}`,
    sourceCardId: q.sourceCardId,
    question: q.question,
    options: q.options,
    correctAnswerIndex: q.correctAnswerIndex,
  }));
}

// ─── Phase 3: Generate Gap Cards ─────────────────────────────────────────────
export async function generateGapCards(cards, missedCardIds) {
  if (!missedCardIds?.length) return [];

  const result = await post('/generate-gap-cards', { cards, missedCardIds });

  return (result.gapCards || []).map((c, i) => ({
    id: c.id || `g${i + 1}`,
    front: c.front,
    back: c.back,
    isGapCard: true,
    targetCardId: c.targetCardId,
  }));
}
