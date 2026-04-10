export const mockFlashcards = [
  { id: '1', front: 'What is Mitosis?', back: 'A process of cell duplication where one cell divides into two genetically identical daughter cells.' },
  { id: '2', front: 'What are the 4 main phases of Mitosis?', back: 'Prophase, Metaphase, Anaphase, Telophase (PMAT).' },
  { id: '3', front: 'What happens explicitly during Anaphase?', back: 'Sister chromatids are pulled apart toward opposite poles of the cell.' },
  { id: '4', front: 'What is the purpose of Mitosis?', back: 'Growth, repair, and replacement of cells.' },
];

export const mockQuiz = [
  {
    id: 'q1',
    sourceCardId: '1',
    question: 'What is the end result of Mitosis?',
    options: ['Four genetically different cells', 'Two genetically identical daughter cells', 'One enlarged cell', 'A pair of gametes'],
    correctAnswerIndex: 1
  },
  {
    id: 'q2',
    sourceCardId: '2',
    question: 'Which of the following is NOT a main phase of Mitosis?',
    options: ['Prophase', 'Interphase', 'Metaphase', 'Anaphase'],
    correctAnswerIndex: 1
  },
  {
    id: 'q3',
    sourceCardId: '3',
    question: 'During which phase are sister chromatids pulled apart?',
    options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
    correctAnswerIndex: 2
  }
];

export const mockGapCards = [
  { id: 'g1', isGapCard: true, front: 'Analogy for Anaphase', back: 'Think of "Ana" parting ways. "A" for Apart. The pairs (chromatids) are forcefully separated to opposite ends.' },
  { id: 'g2', isGapCard: true, front: 'Why do they pull apart in Anaphase?', back: 'So that when the cell finally splits in two, each new cell has an exact, complete set of genetic instructions.' }
];
