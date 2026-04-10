import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Library, BookOpen, Brain, Trash2, ChevronRight, Download, Clock } from 'lucide-react';
import { fmtDate, exportToCSV } from '../utils/helpers';

export function LibraryView({ decks, onLoadDeck, onDeleteDeck }) {
  const [search, setSearch] = useState('');
  const filtered = decks.filter(d => d.topic?.toLowerCase().includes(search.toLowerCase()));
  const [now] = useState(() => Date.now());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl"
    >
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Library className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Your Library</h1>
          <p className="text-sm font-bold text-foreground-muted">Review past topics and concepts</p>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search your decks…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-surface border border-border focus:border-primary rounded-2xl px-6 py-4 outline-none transition-colors text-base font-medium mb-6 shadow-sm"
      />

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-3xl border border-border">
          <BookOpen className="w-12 h-12 text-foreground-muted/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">No decks yet</h2>
          <p className="text-foreground-muted mb-6">Create your first flashcard deck from the dashboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(deck => {
            const results = deck.quizResults || [];
            const bestScore = results.length > 0
              ? Math.max(...results.map(r => r.score / r.total))
              : null;

            return (
              <motion.div
                key={deck.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-surface rounded-3xl p-6 border border-border hover:shadow-lg hover:border-primary/30 transition-all group flex flex-col focus-ring"
                tabIndex={0}
                onClick={() => onLoadDeck(deck)}
                onKeyDown={(e) => e.key === 'Enter' && onLoadDeck(deck)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); exportToCSV(deck); }}
                      title="Download CSV for Anki"
                      className="text-foreground-muted/50 hover:text-primary p-1 focus-ring rounded"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete "${deck.topic}"?`)) {
                          onDeleteDeck(deck.id);
                        }
                      }}
                      title="Delete deck"
                      className="text-foreground-muted/50 hover:text-accent p-1 focus-ring rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-black text-foreground text-lg leading-tight mb-1 capitalize group-hover:text-primary transition-colors">{deck.topic}</h3>
                <p className="text-xs text-foreground-muted font-semibold mb-3">{deck.cards.length} cards · {fmtDate(deck.createdAt)}</p>

                {deck.nextReviewDate && deck.nextReviewDate < now && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-accent bg-accent/10 w-fit px-2 py-0.5 rounded-md mb-4 border border-accent/20">
                    <Clock className="w-3 h-3" /> Due for review
                  </div>
                )}

                {bestScore !== null && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${bestScore * 100}%`,
                          backgroundColor: bestScore === 1 ? 'var(--color-secondary)' : 'var(--color-primary)',
                        }}
                      />
                    </div>
                    <span className="text-xs font-black text-foreground-muted tabular-nums">{Math.round(bestScore * 100)}%</span>
                  </div>
                )}

                <div className="mt-auto pt-3 border-t border-border">
                  <button
                    onClick={(e) => { e.stopPropagation(); onLoadDeck(deck); }}
                    className="w-full text-sm font-bold text-primary hover:text-indigo-500 transition-colors flex items-center justify-center gap-1 group/btn focus-ring rounded"
                  >
                    Study Again <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
