import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, basename } from 'path'; 
import http from 'http';
import iconv from 'iconv-lite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ПУТИ
const DOWNLOADS_DIR = join(process.cwd(), 'public', 'downloads');
const DATA_OUTPUT = join(__dirname, '../src/app/data/homeworkData.ts');
const BASE_URL = 'http://nsbonline.ru';

// ГРУППЫ (проверь расширения .html или .htm)
const GROUPS = [
  { id: 'b1', name: 'B1', page: 'group_b1_fkn1_02_2026.html' },
  { id: 'b2', name: 'B2', page: 'group_b2_fkn1_02_2026.html' },
  { id: 'mbs07', name: 'МБС-07', page: 'group_mbs07_fkn3_02_2026.htm' },
  { id: 'mpb06', name: 'МПБ-06', page: 'group_mpb06_fkn3_02_2026.html' },
];

// 1. Чистим папку перед скачиванием
if (!existsSync(DOWNLOADS_DIR)) {
  mkdirSync(DOWNLOADS_DIR, { recursive: true });
} else {
  readdirSync(DOWNLOADS_DIR).forEach(file => {
    if (file !== '.gitkeep') unlinkSync(join(DOWNLOADS_DIR, file));
  });
}

async function downloadFile(url: string): Promise<string | null> {
  if (!url.includes('.') || url.includes('html')) return null;
  const fileName = basename(url);
  const filePath = join(DOWNLOADS_DIR, fileName);
  return new Promise((resolve) => {
    http.get(url, (res) => {
      if (res.statusCode !== 200) { resolve(null); return; }
      const chunks: any[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        writeFileSync(filePath, Buffer.concat(chunks));
        resolve(`downloads/${fileName}`); // Этот путь пойдет в базу
      });
    }).on('error', () => resolve(null));
  });
}

async function fetchPage(url: string): Promise<string> {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(iconv.decode(Buffer.concat(chunks), 'win1251')));
    }).on('error', () => resolve(''));
  });
}

async function start() {
  console.log('--- Начинаю парсинг и загрузку файлов ---');
  const allEntries: any[] = [];

  for (const group of GROUPS) {
    console.log(`Обработка ${group.name}...`);
    const html = await fetchPage(`${BASE_URL}/${group.page}`);
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let match;

    while ((match = rowRegex.exec(html)) !== null) {
      const cells: string[] = [];
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      let cMatch;
      while ((cMatch = cellRegex.exec(match[1]))) cells.push(cMatch[1]);

      if (cells.length >= 4) {
        const date = cells[0].replace(/<[^>]*>/g, '').split(',')[0].trim();
        if (!date || date.length < 3) continue;

        const tasks: any[] = [];
        const taskNames = ['На паре', 'ДЗ', 'Долг'];

        for (let i = 1; i <= 3; i++) {
          const content = cells[i];
          if (!content || content.includes('&nbsp;')) continue;

          const linkMatch = content.match(/href=["']([^"']+)["']/i);
          let fileUrl = '';
          
          if (linkMatch) {
            const rawUrl = linkMatch[1].startsWith('http') ? linkMatch[1] : `${BASE_URL}/${linkMatch[1]}`;
            const localPath = await downloadFile(rawUrl);
            fileUrl = localPath ? localPath : rawUrl;
          }

          tasks.push({
            question: taskNames[i-1],
            description: content.replace(/<[^>]*>/g, ' ').trim(),
            fileUrl: fileUrl,
            type: i === 1 ? 'in_class' : i === 2 ? 'homework' : 'debt'
          });
        }

        if (tasks.length) {
          allEntries.push({ id: Date.now() + Math.random(), date, group: group.id, tasks });
        }
      }
    }
  }

  const content = `import type { HomeworkEntry } from '../types/homework';\n\nexport const dateEntries: any[] = ${JSON.stringify(allEntries, null, 2)};`;
  writeFileSync(DATA_OUTPUT, content);
  console.log(`Готово! Записано ${allEntries.length} строк.`);
}

start();