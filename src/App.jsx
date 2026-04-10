import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Library, BarChart3, AlertTriangle, X, WifiOff, Home, Sun, Moon } from 'lucide-react';
import { generateFlashcards, generateQuiz, generateGapCards, generateGapQuiz } from './services/llm';
import { useLibrary } from './hooks/useLibrary';
import { VIEWS, uuid } from './utils/constants';
import { calculateNextReview } from './utils/helpers';

import { DashboardView } from './components/DashboardView';
import { LearnView } from './components/LearnView';
import { QuizView } from './components/QuizView';
import { AdaptView } from './components/AdaptView';
import { LibraryView } from './components/LibraryView';
import { StatsView } from './components/StatsView';
import { LoadingOverlay } from './components/LoadingOverlay';

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState(VIEWS.DASHBOARD);
  const [topic, setTopic] = useState('');
  const [cards, setCards] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [gapCards, setGapCards] = useState([]);
  const [gapQuiz, setGapQuiz] = useState([]);
  const [quizScore, setQuizScore] = useState(0);
  const [missedCardIds, setMissedCardIds] = useState([]);
  const [activeDeckId, setActiveDeckId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');
  const [reQuizScore, setReQuizScore] = useState(0);
  const [reQuizTotal, setReQuizTotal] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const { decks, addDeck, updateDeck, deleteDeck } = useLibrary();

  // ── Theme Effect ────────────────────────────────────────────────────────────
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  // ── Loading helper ──────────────────────────────────────────────────────────
  const withLoading = useCallback(async (msg, fn) => {
    setLoading(true);
    setLoadingMsg(msg);
    setError('');
    try {
      return await fn();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Phase 1: Generate flashcards ────────────────────────────────────────────
  const handleStartLearn = useCallback(async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const result = await withLoading('✨ Generating your flashcards…', () =>
      generateFlashcards(topic)
    );
    if (!result) return;

    const deckId = uuid();
    addDeck({ 
      id: deckId, 
      topic: result.topic, 
      cards: result.cards, 
      quizResults: [], 
      createdAt: Date.now(),
      nextReviewDate: Date.now(),
      interval: 0,
      repetition: 0,
      easeFactor: 2.5
    });
    setActiveDeckId(deckId);
    setCards(result.cards);
    setGapCards([]);
    setView(VIEWS.LEARN);
  }, [topic, withLoading, addDeck]);

  // ── Phase 2: Begin quiz ─────────────────────────────────────────────────────
  const handleBeginQuiz = useCallback(async () => {
    const result = await withLoading('🎯 Building your quiz…', () => generateQuiz(cards));
    if (!result) return;
    setQuiz(result);
    setView(VIEWS.PROVE);
  }, [cards, withLoading]);

  // ── Phase 3: Finish quiz & generate gap cards ───────────────────────────────
  const handleFinishQuiz = useCallback(async (score, missedIds) => {
    setQuizScore(score);
    setMissedCardIds(missedIds);
    setView(VIEWS.ADAPT);

    if (activeDeckId) {
      const existing = decks.find(d => d.id === activeDeckId);
      const { nextReviewDate, interval, repetition, easeFactor } = calculateNextReview(
        score, 
        quiz.length, 
        existing?.repetition || 0, 
        existing?.interval || 0, 
        existing?.easeFactor || 2.5
      );
      
      updateDeck(activeDeckId, {
        quizResults: [
          ...(existing?.quizResults || []),
          { score, total: quiz.length, missedIds, ts: Date.now() },
        ],
        nextReviewDate,
        interval,
        repetition,
        easeFactor
      });
    }

    if (missedIds.length > 0) {
      const gaps = await withLoading('🔍 Generating Gap Cards…', () =>
        generateGapCards(cards, missedIds)
      );
      if (gaps) setGapCards(gaps);
    }
  }, [cards, quiz, activeDeckId, withLoading, updateDeck, decks]);

  // ── Phase 3.5: Finish Gap Revision & Build Gap Quiz ─────────────────────────
  const handleFinishGapCards = useCallback(async () => {
    const result = await withLoading('🎯 Building your Re-Test…', () => generateGapQuiz(gapCards));
    if (!result) return;
    setGapQuiz(result);
    setView(VIEWS.REPROVE);
  }, [gapCards, withLoading]);

  // ── Phase 4: Finish Re-Test ─────────────────────────────────────────────────
  const handleFinishReQuiz = useCallback((score, missedIds) => {
    setReQuizScore(score);
    setReQuizTotal(score + missedIds.length);
    setView(VIEWS.REPROVE_RESULT);
  }, []);

  // ── Load deck from library ──────────────────────────────────────────────────
  const handleLoadDeck = useCallback((deck) => {
    setTopic(deck.topic);
    setCards(deck.cards);
    setActiveDeckId(deck.id);
    setGapCards([]);
    setView(VIEWS.LEARN);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col selection:bg-primary selection:text-white transition-colors duration-300">

      {/* ── Navigation ── */}
      <header className="w-full px-6 md:px-10 py-4 flex justify-between items-center z-20 border-b border-border bg-surface/80 backdrop-blur-xl sticky top-0 transition-colors duration-300">
        <button
          onClick={() => setView(VIEWS.DASHBOARD)}
          className="flex items-center gap-2 focus-ring rounded-lg"
        >
          <div className="w-8 h-8 rounded-full border-[3px] border-primary flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-primary rounded-full transition-colors duration-300" />
          </div>
          <span className="font-black text-xl tracking-tight text-primary transition-colors duration-300">RECALL</span>
        </button>

        <nav className="hidden md:flex gap-10 text-xs font-bold tracking-widest text-foreground-muted">
          {[
            { label: 'DASHBOARD', v: VIEWS.DASHBOARD },
            { label: 'LIBRARY', v: VIEWS.LIBRARY },
            { label: 'STATS', v: VIEWS.STATS },
          ].map(n => (
            <button
              key={n.v}
              onClick={() => setView(n.v)}
              className={`transition-colors hover:text-primary pb-0.5 focus-ring rounded-sm ${view === n.v ? 'text-primary border-b-2 border-primary' : ''}`}
            >
              {n.label}
            </button>
          ))}
          <button onClick={toggleTheme} className="ml-4 text-foreground-muted hover:text-foreground transition-colors focus-ring rounded-full p-1 -m-1">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </nav>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-4">
          <button onClick={toggleTheme} className="text-xs font-bold tracking-wider text-foreground-muted p-1 focus-ring rounded-full">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => setView(VIEWS.DASHBOARD)} className={`text-xs font-bold tracking-wider p-1 focus-ring rounded-full ${view === VIEWS.DASHBOARD ? 'text-primary' : 'text-foreground-muted'}`}>
            <Home className="w-5 h-5" />
          </button>
          <button onClick={() => setView(VIEWS.LIBRARY)} className={`text-xs font-bold tracking-wider p-1 focus-ring rounded-full ${view === VIEWS.LIBRARY ? 'text-primary' : 'text-foreground-muted'}`}>
            <Library className="w-5 h-5" />
          </button>
          <button onClick={() => setView(VIEWS.STATS)} className={`text-xs font-bold tracking-wider p-1 focus-ring rounded-full ${view === VIEWS.STATS ? 'text-primary' : 'text-foreground-muted'}`}>
            <BarChart3 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Error Banner ── */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute z-30 top-20 left-1/2 -translate-x-1/2 mt-4 bg-surface rounded-2xl shadow-xl border border-accent/20 p-5 flex items-start gap-4 max-w-md w-[90%]">
            <AlertTriangle className="w-6 h-6 text-accent flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-accent">Something went wrong</p>
              <p className="text-foreground-muted mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-foreground-muted hover:text-foreground flex-shrink-0 focus-ring rounded">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <main className="flex-grow flex items-start md:items-center justify-center p-4 sm:p-8 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {view === VIEWS.DASHBOARD && (
            <DashboardView key="d" topic={topic} setTopic={setTopic} onStart={handleStartLearn} decks={decks} onLoadDeck={handleLoadDeck} />
          )}
          {view === VIEWS.LEARN && (
            <LearnView key="l" cards={cards} onFinish={handleBeginQuiz} onExit={() => setView(VIEWS.DASHBOARD)} topic={topic} />
          )}
          {view === VIEWS.PROVE && (
            <QuizView key="p" quiz={quiz} onFinish={handleFinishQuiz} onExit={() => setView(VIEWS.DASHBOARD)} topic={topic} sourceCards={cards} />
          )}
          {view === VIEWS.ADAPT && (
            <AdaptView
              key="a"
              score={quizScore}
              total={quiz.length}
              topic={topic}
              missedCardIds={missedCardIds}
              cards={cards}
              gapCards={gapCards}
              onRefine={() => setView(VIEWS.REFINE)}
              onReset={() => setView(VIEWS.DASHBOARD)}
            />
          )}
          {view === VIEWS.REFINE && (
            <LearnView key="r" cards={gapCards} onFinish={handleFinishGapCards} onExit={() => setView(VIEWS.DASHBOARD)} topic={topic} isGapMode />
          )}
          {view === VIEWS.REPROVE && (
            <QuizView 
              key="rp" 
              quiz={gapQuiz} 
              onFinish={handleFinishReQuiz} 
              onExit={() => setView(VIEWS.DASHBOARD)}
              topic={`${topic} (Re-Test)`} 
              sourceCards={gapCards}
            />
          )}
          {view === VIEWS.REPROVE_RESULT && (
            <motion.div key="rpr" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="max-w-xl w-full text-center">
               {(() => {
                 const pct = reQuizTotal > 0 ? (reQuizScore / reQuizTotal) * 100 : 0;
                 const color = pct >= 100 ? 'var(--color-secondary)' : pct >= 60 ? 'var(--color-primary)' : 'var(--color-accent)';
                 return (
                   <div className="mx-auto w-36 h-36 rounded-full mb-6 flex flex-col items-center justify-center shadow-xl" style={{ backgroundColor: color, boxShadow: `0 16px 48px ${color}80` }}>
                     <span className="text-5xl font-black text-white tabular-nums">{Math.round(pct)}%</span>
                   </div>
                 );
               })()}
               <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-foreground">Re-Test Complete</h1>
               <p className="text-lg text-foreground-muted font-medium mb-10">You scored {reQuizScore} out of {reQuizTotal} on your gap concepts.</p>
               <button onClick={() => setView(VIEWS.DASHBOARD)} className="btn-primary py-4 px-8 rounded-full uppercase tracking-widest text-sm flex items-center justify-center gap-2 mx-auto font-bold focus-ring">
                 <CheckCircle className="w-5 h-5" /> Finish Session
               </button>
            </motion.div>
          )}
          {view === VIEWS.LIBRARY && (
            <LibraryView key="lib" decks={decks} onLoadDeck={handleLoadDeck} onDeleteDeck={deleteDeck} />
          )}
          {view === VIEWS.STATS && (
            <StatsView key="s" decks={decks} />
          )}
        </AnimatePresence>
      </main>

      {/* ── Loading overlay ── */}
      <AnimatePresence>
        {loading && <LoadingOverlay message={loadingMsg} />}
      </AnimatePresence>
    </div>
  );
}
