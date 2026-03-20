/**
 * Parser for nsbonline.ru - ALL GROUPS AT ONCE
 * Saves ALL links from each cell
 * 
 * Usage: npm run parse
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import http from 'http';
import { Buffer } from 'buffer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Task {
  question: string;
  description: string;  // HTML with ALL links preserved
  fileUrl?: string;
  type: 'in_class' | 'homework' | 'debt' | 'rating_file';
}

interface HomeworkEntry {
  id: number;
  date: string;
  group: string;
  tasks: Task[];
}

const BASE_URL = 'http://nsbonline.ru';
const OUTPUT_PATH = join(__dirname, '../src/app/data/homeworkData.ts');

const GROUPS = [
  { id: 'b1', name: 'B1', page: 'group_b1_fkn1_02_2026.html' },
  { id: 'b2', name: 'B2', page: 'group_b2_fkn1_02_2026.html' },
  { id: 'mbs07', name: 'МБС-07', page: 'group_mbs07_fkn3_02_2026.htm' },
  { id: 'mpb06', name: 'МПБ-06', page: 'group_mpb06_fkn3_02_2026.html' },
];

function decodeWindows1251(buffer: Buffer): string {
  const result: number[] = [];
  for (let i = 0; i < buffer.length; i++) {
    const code = buffer[i];
    if (code >= 0xA0 && code <= 0xFF) {
      result.push(code + 0x350);
    } else {
      result.push(code);
    }
  }
  return String.fromCharCode(...result);
}

async function fetchPage(url: string): Promise<string> {
  return new Promise((resolve) => {
    const options = {
      hostname: new URL(url).hostname,
      port: 80,
      path: new URL(url).pathname,
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000,
    };

    http.get(options, (res: any) => {
      const chunks: Buffer[] = [];
      if (res.statusCode !== 200) {
        resolve('');
        return;
      }
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => resolve(decodeWindows1251(Buffer.concat(chunks))));
    }).on('error', () => resolve(''));
  });
}

// Extract ALL links from HTML and preserve original HTML structure
function processCellHtml(html: string): { description: string; fileUrl?: string; allFileUrls: string[] } {
  // Find all links
  const links: Array<{ url: string; text: string }> = [];
  const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]*)<\/a>/gi;
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    let url = match[1];
    if (!url.startsWith('http')) {
      url = `${BASE_URL}/${url}`;
    }
    // Добавляем даже если текст пустой
    links.push({ url, text: match[2] || 'Скачать' });
  }
  
  // Clean up the HTML - remove extra whitespace but preserve structure
  const cleanHtml = html
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '> <')
    .trim();
  
  return {
    description: cleanHtml,
    fileUrl: links[0]?.url,
    allFileUrls: links.map(l => l.url),
  };
}

function parseRow(rowHtml: string): { date: string; tasks: Task[] } | null {
  const cells: string[] = [];
  const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  let match;

  while ((match = cellRegex.exec(rowHtml)) !== null) {
    cells.push(match[1]);
  }

  if (cells.length < 4) return null;

  // Extract date
  const dateText = cells[0]
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .split(',')[0]
    .trim();
    
  if (!dateText || dateText.length < 3) return null;

  const tasks: Task[] = [];

  // AT THE LESSON - process ALL links
  if (cells[1] && !cells[1].includes('&nbsp;')) {
    const processed = processCellHtml(cells[1]);
    if (processed.description) {
      tasks.push({
        question: 'На паре',
        description: processed.description,
        fileUrl: processed.fileUrl,
        type: 'in_class',
      });
    }
  }

  // HOME TASK - process ALL links
  if (cells[2] && !cells[2].includes('&nbsp;')) {
    const processed = processCellHtml(cells[2]);
    if (processed.description) {
      tasks.push({
        question: 'ДЗ',
        description: processed.description,
        fileUrl: processed.fileUrl,
        type: 'homework',
      });
    }
  }

  // FOR ABSENT - process ALL links
  if (cells[3] && !cells[3].includes('&nbsp;')) {
    const processed = processCellHtml(cells[3]);
    if (processed.description) {
      tasks.push({
        question: 'Долг',
        description: processed.description,
        fileUrl: processed.fileUrl,
        type: 'debt',
      });
    }
  }

  // RATING - process ALL links
  if (cells[4] && !cells[4].includes('&nbsp;')) {
    const cellText = cells[4].toLowerCase();
    if (cellText.includes('рейтинг') || cellText.includes('points')) {
      const processed = processCellHtml(cells[4]);
      // Добавляем все ссылки на рейтинг
      if (processed.allFileUrls.length > 0) {
        processed.allFileUrls.forEach((url, idx) => {
          tasks.push({
            question: idx === 0 ? 'Рейтинг' : `Рейтинг (${idx + 1})`,
            description: `<a href="${url.replace(`${BASE_URL}/`, '')}" target="_blank">рейтинг</a>`,
            fileUrl: url,
            type: 'rating_file',
          });
        });
      } else {
        tasks.push({
          question: 'Рейтинг',
          description: 'Таблица баллов',
          fileUrl: processed.fileUrl,
          type: 'rating_file',
        });
      }
    }
  }

  return { date: dateText, tasks };
}

function parseGroupPage(html: string, groupId: string): HomeworkEntry[] {
  const entries: HomeworkEntry[] = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let match;
  let isHeader = true;

  while ((match = rowRegex.exec(html)) !== null) {
    if (isHeader) {
      isHeader = false;
      if (match[1].includes('DATE')) continue;
    }
    const result = parseRow(match[1]);
    if (result?.tasks.length) {
      entries.push({
        id: Date.now() + entries.length,
        date: result.date,
        group: groupId,
        tasks: result.tasks,
      });
    }
  }

  return entries;
}

export async function parseHomework(): Promise<void> {
  console.log('Parsing all groups...\n');
  
  const allEntries: HomeworkEntry[] = [];

  for (const group of GROUPS) {
    console.log(`Fetching ${group.name}...`);
    const html = await fetchPage(`${BASE_URL}/${group.page}`);
    
    if (html) {
      const entries = parseGroupPage(html, group.id);
      console.log(`  ✓ ${entries.length} entries\n`);
      allEntries.push(...entries);
    } else {
      console.log(`  ✗ Failed\n`);
    }
  }

  if (allEntries.length === 0) {
    console.log('No data parsed.');
    return;
  }

  const content = `import type { HomeworkEntry } from '../types/homework';\n\nexport const dateEntries: HomeworkEntry[] = ${JSON.stringify(allEntries, null, 2)};`;

  if (existsSync(OUTPUT_PATH)) {
    writeFileSync(OUTPUT_PATH.replace('.ts', `.backup.${Date.now()}.ts`), readFileSync(OUTPUT_PATH, 'utf-8'));
  }
  writeFileSync(OUTPUT_PATH, content);
  
  console.log(`✓ Saved ${allEntries.length} total entries`);
  console.log(`\nGroups: ${GROUPS.map(g => g.name).join(', ')}`);
}

if (process.argv[1]?.endsWith('parse-homework.ts')) {
  parseHomework();
}
