import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Zap, RefreshCcw, Sparkles, Award } from 'lucide-react';

export function AdaptView({ score, total, topic, missedCardIds, cards, gapCards, onRefine, onReset }) {
  const percentage = Math.round((score / total) * 100);
  const isPerfect = score === total;
  const missedCards = cards.filter(c => missedCardIds.includes(c.id));
  const hasGaps = gapCards.length > 0;
  const scoreColor = isPerfect ? 'var(--color-secondary)' : percentage >= 60 ? 'var(--color-primary)' : 'var(--color-accent)';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl w-full"
    >
      {/* Score display */}
      <div className="text-center mb-10">
        <div
          className="mx-auto w-36 h-36 rounded-full mb-6 flex flex-col items-center justify-center shadow-xl"
          style={{ backgroundColor: scoreColor, boxShadow: `0 16px 48px ${scoreColor}40` }}
        >
          <span className="text-5xl font-black text-white tabular-nums">{percentage}%</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-foreground">
          {isPerfect ? '🎉 Flawless Recall.' : percentage >= 60 ? 'Good Progress.' : 'Gap Detected.'}
        </h1>
        <p className="text-lg text-foreground-muted font-medium">
          {isPerfect
            ? `Perfect score on "${topic}". You've mastered all ${total} concepts.`
            : `${score} of ${total} correct on "${topic}". Let's close the gap.`}
        </p>
      </div>

      {isPerfect && (
        <div className="bg-secondary/10 border-2 border-secondary/30 rounded-3xl p-7 text-center mb-8">
          <Award className="w-10 h-10 text-secondary mx-auto mb-3" />
          <p className="font-bold text-foreground">Outstanding! No gap cards needed. Try a new topic or revisit your library.</p>
        </div>
      )}

      {!isPerfect && (
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-accent" />
            <p className="text-xs font-black tracking-widest text-foreground-muted uppercase">Concepts to Revisit</p>
          </div>
          {missedCards.map(c => (
            <div key={c.id} className="bg-surface rounded-2xl border-2 border-accent/20 p-5">
              <p className="font-bold text-foreground">{c.front}</p>
              <p className="text-sm text-foreground-muted mt-1">{c.back}</p>
            </div>
          ))}

          <AnimatePresence>
            {hasGaps && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-accent/5 border-2 border-accent/20 rounded-2xl p-5 flex gap-3 items-start mt-3"
              >
                <Zap className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">{gapCards.length} Gap Card{gapCards.length !== 1 ? 's' : ''} Ready</p>
                  <p className="text-sm text-foreground-muted mt-0.5">Fresh explanations from a different angle — created just for what you missed.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {!isPerfect && hasGaps && (
          <button
            onClick={onRefine}
            className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm uppercase tracking-widest focus-ring"
            style={{ backgroundColor: 'var(--color-accent)', boxShadow: '0 8px 24px var(--color-accent)' }}
          >
            <RefreshCcw className="w-4 h-4" /> Close the Loop
          </button>
        )}
        <button
          onClick={onReset}
          className={`flex-1 flex items-center justify-center gap-2 py-4 px-8 rounded-full font-bold text-sm uppercase tracking-widest transition-all focus-ring ${isPerfect ? 'btn-primary' : 'border-2 border-border text-foreground hover:border-primary hover:text-primary bg-surface'}`}
        >
          {isPerfect ? <><Sparkles className="w-4 h-4" /> New Topic</> : 'Back to Dashboard'}
        </button>
      </div>
    </motion.div>
  );
}
