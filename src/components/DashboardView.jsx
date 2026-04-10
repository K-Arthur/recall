import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ChevronRight, Clock } from 'lucide-react';
import { fmtDate } from '../utils/helpers';

export function DashboardView({ topic, setTopic, onStart, decks, onLoadDeck }) {
  const recentDecks = decks.slice(0, 3);
  const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);
  const [now] = React.useState(() => Date.now());

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-12"
    >
      {/* Left: animated visual */}
      <div className="flex-1 relative hidden md:flex justify-center items-center min-h-[400px]">
        <div className="absolute w-[380px] h-[380px] rounded-full border border-primary/10 animate-[spin_80s_linear_infinite]" />
        <div className="absolute w-[280px] h-[280px] rounded-full border border-primary/20 animate-[spin_50s_linear_infinite_reverse]" />
        <div className="absolute w-[180px] h-[180px] rounded-full border-2 border-primary/15 animate-[spin_25s_linear_infinite]" />
        <div className="w-56 h-56 bg-gradient-to-tr from-primary via-indigo-400 to-secondary rounded-full blur-[90px] opacity-20 animate-pulse" />

        {/* Floating stat cards */}
        <motion.div
          animate={{ y: [-6, 6, -6] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-8 right-4 bg-surface rounded-2xl shadow-lg border border-border p-4 text-center min-w-[96px]"
        >
          <div className="text-2xl font-black text-primary">{decks.length}</div>
          <div className="text-[9px] font-bold tracking-widest text-foreground-muted uppercase mt-0.5">Decks Created</div>
        </motion.div>
        <motion.div
          animate={{ y: [6, -6, 6] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 left-0 bg-surface rounded-2xl shadow-lg border border-border p-4 text-center min-w-[96px]"
        >
          <div className="text-2xl font-black text-secondary">{totalCards}</div>
          <div className="text-[9px] font-bold tracking-widest text-foreground-muted uppercase mt-0.5">Cards Learned</div>
        </motion.div>

        <p className="text-[9px] font-bold tracking-widest text-foreground-muted opacity-50 absolute left-4 bottom-36 max-w-[120px] uppercase leading-relaxed">
          Adaptive learning, powered by AI
        </p>
      </div>

      {/* Right: hero + input */}
      <div className="flex-1 max-w-xl w-full">
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-widest text-primary uppercase bg-primary/10 rounded-full px-3 py-1">
            <Sparkles className="w-3 h-3" /> AI-Powered Flashcards & Quizzes
          </span>
        </div>

        <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-black tracking-tighter leading-[0.85] text-foreground mb-6">
          DON'T JUST<br />
          <span className="text-primary">REVIEW.</span><br />
          PROVE IT.
        </h1>
        
        <p className="text-foreground-muted font-medium mb-10 text-lg md:hidden">
          Study with AI flashcards, then prove your knowledge with generated quizzes. We automatically adapt to your weak points.
        </p>

        <form onSubmit={onStart} className="space-y-6 mb-10">
          <div className="relative group">
            <textarea
              id="topic-input"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              maxLength={5000}
              placeholder="Enter a topic or paste your study notes…&#10;e.g. The French Revolution, Photosynthesis, React Hooks"
              rows={3}
              className="w-full resize-none text-base font-medium bg-surface border-2 border-border focus:border-primary rounded-2xl px-5 py-4 outline-none transition-colors placeholder:text-foreground-muted/50 shadow-sm focus-ring"
              required
            />
          </div>
          <button
            id="generate-btn"
            type="submit"
            className="btn-primary flex items-center gap-3 group text-sm uppercase tracking-widest w-full sm:w-auto justify-center focus-ring"
          >
            <Sparkles className="w-4 h-4" />
            Generate My Deck
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Recent decks */}
        {recentDecks.length > 0 && (
          <div>
            <p className="text-[10px] font-black tracking-widest text-foreground-muted uppercase mb-3">Your Recent Decks</p>
            <div className="space-y-2">
              {recentDecks.map(deck => (
                <button
                  key={deck.id}
                  onClick={() => onLoadDeck(deck)}
                  className="w-full text-left flex items-center justify-between p-4 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:shadow-md transition-all group focus-ring"
                >
                  <div>
                    <div className="font-bold text-foreground group-hover:text-primary transition-colors capitalize flex items-center gap-2">
                      {deck.topic}
                      {deck.nextReviewDate && deck.nextReviewDate < now && <Clock className="w-3.5 h-3.5 text-accent" title="Due for review" />}
                    </div>
                    <div className="text-xs text-foreground-muted mt-0.5">{deck.cards.length} cards · {fmtDate(deck.createdAt)}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-foreground-muted/50 group-hover:text-primary transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
