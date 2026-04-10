import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, RefreshCcw, Volume2, X } from 'lucide-react';

export function LearnView({ cards, onFinish, onExit, topic, isGapMode = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const card = cards[currentIndex];
  const accentColor = isGapMode ? 'var(--color-accent)' : 'var(--color-primary)';
  const progress = (currentIndex / cards.length) * 100;

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(p => p + 1), 200);
    } else {
      onFinish();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if ((e.key === 'ArrowRight' || e.key === 'Enter') && isFlipped) {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentIndex, cards.length, onFinish]);

  const handleReadAloud = (e, text) => {
    e.stopPropagation(); // Prevent card flip
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop current
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!card) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      className="w-full max-w-2xl flex flex-col items-center"
    >
      <div className="w-full flex justify-between items-start mb-5 px-1">
        <div>
          <h2 className="font-black uppercase text-xs tracking-widest" style={{ color: accentColor }}>
            {isGapMode ? '🔥 Gap Revision' : '📖 Initial Review'}
          </h2>
          <p className="text-xs text-foreground-muted font-semibold mt-0.5 capitalize">{topic}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-bold text-foreground-muted text-sm tabular-nums">{currentIndex + 1} / {cards.length}</span>
          {onExit && (
            <button onClick={onExit} className="text-foreground-muted hover:text-foreground transition-colors p-1 focus-ring rounded" title="End Session">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-border rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: accentColor }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* 3D Flip Card */}
      <div
        className="relative w-full cursor-pointer group select-none"
        style={{ aspectRatio: '4/3' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformStyle: 'preserve-3d', position: 'relative' }}
        >
          {/* Front */}
          <div
            className="absolute w-full h-full glass-card flex flex-col items-center justify-center p-8 sm:p-14 text-center group/card"
            style={{ backfaceVisibility: 'hidden', borderTop: `8px solid ${accentColor}` }}
          >
            <button 
              onClick={(e) => handleReadAloud(e, card.front)}
              className="absolute top-4 right-4 p-2.5 rounded-full hover:bg-surface-hover text-foreground-muted hover:text-primary transition-colors opacity-0 group-hover/card:opacity-100 focus-ring"
              title="Read Aloud"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <Brain className="w-10 h-10 mb-6 opacity-10" style={{ color: accentColor }} />
            <h3 className="text-2xl sm:text-4xl font-black text-foreground leading-tight">{card.front}</h3>
            <p className="absolute bottom-5 text-[10px] font-bold tracking-widest text-foreground-muted opacity-50 group-hover:opacity-100 transition-colors uppercase flex items-center gap-1.5">
              Tap to reveal <RefreshCcw className="w-3 h-3" />
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute w-full h-full glass-card flex flex-col items-center justify-center p-8 sm:p-14 text-center group/card"
            style={{ backfaceVisibility: 'hidden', backgroundColor: accentColor, transform: 'rotateY(180deg)', color: 'var(--color-foreground-inverse)' }}
          >
            <button 
              onClick={(e) => handleReadAloud(e, card.back)}
              className="absolute top-4 right-4 p-2.5 rounded-full hover:bg-white/20 text-white/70 hover:text-white transition-colors opacity-0 group-hover/card:opacity-100 focus-ring"
              title="Read Aloud"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <p className="text-xl sm:text-2xl font-bold leading-relaxed">{card.back}</p>
            <p className="absolute bottom-5 text-[10px] font-bold tracking-widest opacity-40 uppercase flex items-center gap-1.5">
              Tap to flip back <RefreshCcw className="w-3 h-3" />
            </p>
          </div>
        </motion.div>
      </div>

      <div className="mt-8 h-14 flex items-center">
        <AnimatePresence>
          {isFlipped && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={e => { e.stopPropagation(); handleNext(); }}
              className="btn-primary text-xs uppercase tracking-widest"
              style={{ backgroundColor: accentColor, boxShadow: `0 8px 24px ${accentColor}40` }}
            >
              {currentIndex < cards.length - 1
                ? 'Got it — Next →'
                : isGapMode ? 'Finish Revision ✓' : 'I\'m Ready — Test Me →'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
