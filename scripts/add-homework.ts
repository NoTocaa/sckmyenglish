/**
 * Helper script to add homework manually
 * 
 * Usage:
 *   npm run add-homework -- "20.03.2026" "Задание 1" "ссылка на файл"
 */

import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_PATH = join(__dirname, '../src/app/data/homeworkData.ts');

function addHomework(date: string, question: string, answer: string, file?: string) {
  const content = readFileSync(DATA_PATH, 'utf-8');
  
  // Extract current entries
  const match = content.match(/export const dateEntries: DateEntry\[\] = (\[.*\]);/s);
  if (!match) {
    console.error('Could not parse existing data');
    return;
  }
  
  const entries = JSON.parse(match[1]);
  
  const newEntry = {
    id: Date.now(),
    date,
    file: file || undefined,
    answers: [
      {
        id: Date.now() + 1,
        question,
        answer,
      },
    ],
  };
  
  entries.unshift(newEntry);
  
  const newContent = `import type { DateEntry } from '../types/homework';

export const dateEntries: DateEntry[] = ${JSON.stringify(entries, null, 2)};
`;
  
  // Backup
  writeFileSync(DATA_PATH.replace('.ts', `.backup.${Date.now()}.ts`), content);
  writeFileSync(DATA_PATH, newContent);
  
  console.log(`✓ Added homework for ${date}`);
  console.log(`  Question: ${question}`);
  console.log(`  Answer: ${answer}`);
  if (file) console.log(`  File: ${file}`);
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Usage: npm run add-homework -- "date" "question" "answer" [file]');
  console.log('Example: npm run add-homework -- "20.03.2026" "Задание 1" "сделать упражнение" "/files/hw.pdf"');
  process.exit(0);
}

const [date, question, answer, file] = args;
addHomework(date, question, answer, file);
