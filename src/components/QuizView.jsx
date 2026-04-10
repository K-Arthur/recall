import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, ArrowRight, X, AlertCircle } from 'lucide-react';

export function QuizView({ quiz, onFinish, onExit, topic, sourceCards }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [missed, setMissed] = useState([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const question = quiz[currentIndex];
  const optionLetters = ['A', 'B', 'C', 'D'];

  const handleSelect = idx => {
    if (hasAnswered) return;
    setSelectedOption(idx);
    setHasAnswered(true);
    if (idx !== question.correctAnswerIndex) {
      setMissed(prev => [...prev, question.sourceCardId]);
    }
  };

  const handleNext = () => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex(p => p + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      onFinish(quiz.length - missed.length, missed);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!hasAnswered) {
        if (e.key >= '1' && e.key <= '4') {
          handleSelect(parseInt(e.key) - 1);
        } else if (['a', 'b', 'c', 'd'].includes(e.key.toLowerCase())) {
          handleSelect(e.key.toLowerCase().charCodeAt(0) - 97);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasAnswered, currentIndex, missed, quiz.length, onFinish]);

  if (!question) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="w-full max-w-3xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-black text-foreground">The Proof</h2>
            <p className="text-xs font-semibold text-foreground-muted capitalize">{topic}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <span className="text-2xl font-black text-primary tabular-nums">{currentIndex + 1}</span>
            <span className="text-foreground-muted font-bold">/{quiz.length}</span>
          </div>
          {onExit && (
            <button onClick={onExit} className="text-foreground-muted hover:text-foreground transition-colors p-1 focus-ring rounded" title="End Session">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-7">
        {quiz.map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-500"
            style={{
              backgroundColor: i < currentIndex ? 'var(--color-secondary)' : i === currentIndex ? 'var(--color-primary)' : '#E5E7EB'
            }}
          />
        ))}
      </div>

      <div className="bg-surface rounded-3xl p-7 sm:p-10 shadow-sm border border-border mb-5 transition-colors duration-300">
        <p className="text-[9px] font-black tracking-widest text-foreground-muted uppercase mb-3">Question {currentIndex + 1}</p>
        <h3 className="text-xl sm:text-2xl font-black text-foreground mb-7 leading-tight">{question.question}</h3>

        <div className="space-y-3">
          {question.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === question.correctAnswerIndex;
            let cls = 'bg-surface-hover border-border hover:border-primary text-foreground cursor-pointer';
            if (hasAnswered) {
              if (isCorrect) cls = 'bg-secondary/10 border-secondary text-secondary font-semibold cursor-default';
              else if (isSelected) cls = 'bg-accent/10 border-accent text-accent cursor-default';
              else cls = 'bg-surface border-border text-foreground-muted cursor-default opacity-40';
            } else if (isSelected) {
              cls = 'bg-primary text-white border-primary cursor-pointer';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 focus-ring ${cls}`}
              >
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${hasAnswered && isCorrect ? 'bg-secondary text-white' : hasAnswered && isSelected && !isCorrect ? 'bg-accent text-white' : isSelected ? 'bg-white/20 text-white' : 'bg-border text-foreground-muted'}`}>
                  {optionLetters[idx]}
                </span>
                <span className="text-base leading-snug">{opt}</span>
                {hasAnswered && isCorrect && <CheckCircle className="w-5 h-5 ml-auto text-secondary flex-shrink-0" />}
              </button>
            );
          })}
        </div>
        
        <AnimatePresence>
          {hasAnswered && selectedOption !== question.correctAnswerIndex && sourceCards && sourceCards.find(c => c.id === question.sourceCardId) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 p-5 rounded-2xl bg-accent/5 border border-accent/20 flex gap-3 overflow-hidden">
              <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-foreground">Concept Check</p>
                <p className="text-sm text-foreground-muted mt-1">{sourceCards.find(c => c.id === question.sourceCardId)?.back}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {hasAnswered && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
            <button onClick={handleNext} className="btn-primary flex items-center gap-2 text-sm uppercase tracking-widest focus-ring">
              {currentIndex < quiz.length - 1 ? 'Next' : 'View Results'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
