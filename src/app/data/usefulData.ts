export interface UsefulFile {
  id: number;
  name: string;
  url?: string;
  description?: string;
  category?: string;
}

export const usefulFiles: UsefulFile[] = [
  { id: 1, name: "Present Simple.pdf", category: "Grammar" },
  { id: 2, name: "Past Continuous.pdf", category: "Grammar" },
  { id: 3, name: "Irregular Verbs List.pdf", category: "Verbs" },
  { id: 4, name: "Phrasal Verbs.pdf", category: "Verbs" },
  { id: 5, name: "Common Mistakes.pdf", category: "Tips" },
  { id: 6, name: "Grammar Rules.pdf", category: "Grammar" },
  { id: 7, name: "Vocabulary A2-B1.pdf", category: "Vocabulary" },
  { id: 8, name: "Writing Templates.pdf", category: "Writing" },
  { id: 9, name: "Listening Exercises.pdf", category: "Listening" },
  { id: 10, name: "Speaking Practice.pdf", category: "Speaking" },
];
