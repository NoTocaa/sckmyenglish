import { useState, useCallback } from 'react';
import type { DateEntry } from '../types/homework';
import { dateEntries as initialData } from '../data/homeworkData';

export function useHomeworkData() {
  const [entries, setEntries] = useState<DateEntry[]>(initialData);

  const addEntry = useCallback((entry: DateEntry) => {
    setEntries(prev => [entry, ...prev]);
  }, []);

  const updateEntry = useCallback((id: number, updates: Partial<DateEntry>) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, ...updates } : entry
    ));
  }, []);

  const deleteEntry = useCallback((id: number) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);

  const addAnswer = useCallback((entryId: number, answer: DateEntry['answers'][number]) => {
    setEntries(prev => prev.map(entry =>
      entry.id === entryId 
        ? { ...entry, answers: [...entry.answers, answer] }
        : entry
    ));
  }, []);

  const updateAnswer = useCallback((entryId: number, answerId: number, updates: Partial<DateEntry['answers'][number]>) => {
    setEntries(prev => prev.map(entry =>
      entry.id === entryId
        ? {
            ...entry,
            answers: entry.answers.map(a => 
              a.id === answerId ? { ...a, ...updates } : a
            )
          }
        : entry
    ));
  }, []);

  const deleteAnswer = useCallback((entryId: number, answerId: number) => {
    setEntries(prev => prev.map(entry =>
      entry.id === entryId
        ? { ...entry, answers: entry.answers.filter(a => a.id !== answerId) }
        : entry
    ));
  }, []);

  return {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    addAnswer,
    updateAnswer,
    deleteAnswer,
  };
}
