
export function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function calculateNextReview(score, total, currentRepetition, currentInterval, currentEaseFactor) {
  const quality = Math.round((score / total) * 5); // 0-5 scale
  let easeFactor = currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  let repetition = currentRepetition;
  let interval = currentInterval;

  if (quality < 3) {
    repetition = 0;
    interval = 1;
  } else {
    repetition += 1;
    if (repetition === 1) {
      interval = 1;
    } else if (repetition === 2) {
      interval = 6;
    } else {
      interval = Math.round(currentInterval * easeFactor);
    }
  }

  const nextReviewDate = Date.now() + interval * 24 * 60 * 60 * 1000;
  return { nextReviewDate, interval, repetition, easeFactor };
}

export function exportToCSV(deck) {
  const headers = ['Front', 'Back'];
  const rows = deck.cards.map(c => [
    `"${c.front.replace(/"/g, '""')}"`,
    `"${c.back.replace(/"/g, '""')}"`
  ]);
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${deck.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_recall_deck.csv`;
  link.click();
}
