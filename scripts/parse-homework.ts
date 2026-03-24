import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import http from 'http';
import iconv from 'iconv-lite'; // Важно для Win-1251

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Task {
  question: string;
  description: string;
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

async function fetchPage(url: string): Promise<string> {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      const chunks: Buffer[] = [];
      if (res.statusCode !== 200) {
        resolve('');
        return;
      }
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        // Используем iconv для корректного декодирования кириллицы
        resolve(iconv.decode(buffer, 'win1251'));
      });
    }).on('error', (err) => {
      console.error(`Ошибка сети: ${err.message}`);
      resolve('');
    });
  });
}

function processCellHtml(html: string): { description: string; fileUrl?: string; allFileUrls: string[] } {
  const links: string[] = [];
  const linkRegex = /href=["']([^"']+)["']/gi;
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    let url = match[1];
    if (!url.startsWith('http')) {
      url = `${BASE_URL}/${url}`;
    }
    links.push(url);
  }
  
  const cleanHtml = html
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .trim();
  
  return {
    description: cleanHtml,
    fileUrl: links[0],
    allFileUrls: links,
  };
}

function parseRow(rowHtml: string): { date: string; tasks: Task[] } | null {
  const cells: string[] = [];
  // Регулярка теперь не боится регистра тегов <TD> или <td style="...">
  const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  let match;

  while ((match = cellRegex.exec(rowHtml)) !== null) {
    cells.push(match[1]);
  }

  if (cells.length < 4) return null;

  // Очистка даты от HTML и лишнего мусора
  const dateText = cells[0]
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .split(',')[0]
    .trim();
    
  if (!dateText || dateText.length < 3) return null;

  const tasks: Task[] = [];
  const types: ('in_class' | 'homework' | 'debt')[] = ['in_class', 'homework', 'debt'];

  // Обработка основных колонок (Пара, ДЗ, Долг)
  for (let i = 0; i < 3; i++) {
    const content = cells[i + 1];
    if (content && content.replace(/&nbsp;/gi, '').trim().length > 0) {
      const processed = processCellHtml(content);
      tasks.push({
        question: i === 0 ? 'На паре' : i === 1 ? 'ДЗ' : 'Долг',
        description: processed.description,
        fileUrl: processed.fileUrl,
        type: types[i],
      });
    }
  }

  // Рейтинг (5-я колонка)
  if (cells[4] && cells[4].toLowerCase().includes('рейтинг')) {
    const processed = processCellHtml(cells[4]);
    processed.allFileUrls.forEach((url, idx) => {
      tasks.push({
        question: idx === 0 ? 'Рейтинг' : `Рейтинг (${idx + 1})`,
        description: `<a href="${url}" target="_blank">Открыть таблицу</a>`,
        fileUrl: url,
        type: 'rating_file',
      });
    });
  }

  return tasks.length > 0 ? { date: dateText, tasks } : null;
}

export async function parseHomework(): Promise<void> {
  console.log('--- Запуск парсинга nsbonline.ru ---');
  const allEntries: HomeworkEntry[] = [];

  for (const group of GROUPS) {
    try {
      console.log(`Загрузка группы ${group.name}...`);
      const html = await fetchPage(`${BASE_URL}/${group.page}`);
      
      if (!html) {
        console.warn(`  [!] Не удалось получить данные для ${group.name}`);
        continue;
      }

      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      let match;
      let count = 0;

      while ((match = rowRegex.exec(html)) !== null) {
        const rowHtml = match[1];
        if (rowHtml.toUpperCase().includes('<TH') || rowHtml.includes('DATE')) continue;

        const result = parseRow(rowHtml);
        if (result) {
          allEntries.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            date: result.date,
            group: group.id,
            tasks: result.tasks,
          });
          count++;
        }
      }
      console.log(`  [OK] Обработано строк: ${count}`);
    } catch (e) {
      console.error(`Ошибка при обработке группы ${group.name}:`, e);
    }
  }

  if (allEntries.length === 0) {
    console.error('Критическая ошибка: Данные не найдены ни для одной группы.');
    return;
  }

  const content = `import type { HomeworkEntry } from '../types/homework';\n\nexport const dateEntries: HomeworkEntry[] = ${JSON.stringify(allEntries, null, 2)};`;

  // Бекап и сохранение
  if (existsSync(OUTPUT_PATH)) {
    writeFileSync(OUTPUT_PATH.replace('.ts', `.backup.ts`), readFileSync(OUTPUT_PATH, 'utf-8'));
  }
  
  writeFileSync(OUTPUT_PATH, content);
  console.log(`\nГотово! Всего записей: ${allEntries.length}`);
}

// Запуск
parseHomework().catch(console.error);