import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, BookOpen, Brain, Target, TrendingUp, Award, Clock } from 'lucide-react';
import { fmtDate } from '../utils/helpers';

export function StatsView({ decks }) {
  const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);
  const allResults = decks.flatMap(d => (d.quizResults || []).map(r => ({ ...r, topic: d.topic })));
  const avgScore = allResults.length > 0
    ? Math.round((allResults.reduce((a, r) => a + r.score / r.total, 0) / allResults.length) * 100)
    : null;
  const perfectResults = allResults.filter(r => r.score === r.total).length;

  const statCards = [
    { icon: BookOpen, label: 'Total Decks', value: decks.length, color: 'var(--color-primary)', bg: 'bg-primary/10' },
    { icon: Brain, label: 'Cards Reviewed', value: totalCards, color: 'var(--color-secondary)', bg: 'bg-secondary/10' },
    { icon: Target, label: 'Quizzes Taken', value: allResults.length, color: 'var(--color-primary)', bg: 'bg-primary/10' },
    { icon: TrendingUp, label: 'Avg. Score', value: avgScore !== null ? `${avgScore}%` : '—', color: 'var(--color-accent)', bg: 'bg-accent/10' },
    { icon: Award, label: 'Perfect Scores', value: perfectResults, color: 'var(--color-secondary)', bg: 'bg-secondary/10' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl"
    >
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
        <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-secondary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Your Stats</h1>
          <p className="text-sm font-bold text-foreground-muted">Track your learning progress</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-surface rounded-2xl p-5 border border-border hover:shadow-md transition-all duration-300 group">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <div className="text-3xl font-black" style={{ color: card.color }}>{card.value}</div>
              <div className="text-[9px] text-foreground-muted font-bold uppercase tracking-widest mt-1">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent quiz history */}
      <h2 className="font-black text-xl mb-4 text-foreground">Quiz History</h2>
      {allResults.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-3xl border border-border">
          <Clock className="w-12 h-12 text-foreground-muted/30 mx-auto mb-3" />
          <p className="text-foreground-muted font-semibold">No quizzes yet. Start learning to see your progress here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...allResults].reverse().slice(0, 10).map((r, i) => {
            const pct = Math.round((r.score / r.total) * 100);
            const barColor = pct === 100 ? 'var(--color-secondary)' : pct >= 60 ? 'var(--color-primary)' : 'var(--color-accent)';
            return (
              <div key={i} className="bg-surface rounded-2xl border border-border px-5 py-4 flex items-center gap-4 transition-colors duration-300">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm flex-shrink-0 tabular-nums shadow-sm"
                  style={{ backgroundColor: barColor }}
                >
                  {pct}%
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground truncate capitalize">{r.topic}</p>
                  <p className="text-xs text-foreground-muted mt-0.5">{r.score}/{r.total} correct · {fmtDate(r.ts)}</p>
                </div>
                <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden flex-shrink-0">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
