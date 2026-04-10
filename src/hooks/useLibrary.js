import { useState, useCallback } from 'react';

const STORAGE_KEY = 'recall_library';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save(decks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}

export function useLibrary() {
  const [decks, setDecks] = useState(load);

  const addDeck = useCallback((deck) => {
    setDecks(prev => {
      const updated = [deck, ...prev];
      save(updated);
      return updated;
    });
  }, []);

  const updateDeck = useCallback((id, patch) => {
    setDecks(prev => {
      const updated = prev.map(d => d.id === id ? { ...d, ...patch } : d);
      save(updated);
      return updated;
    });
  }, []);

  const deleteDeck = useCallback((id) => {
    setDecks(prev => {
      const updated = prev.filter(d => d.id !== id);
      save(updated);
      return updated;
    });
  }, []);

  return { decks, addDeck, updateDeck, deleteDeck };
}
