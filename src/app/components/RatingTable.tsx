import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, AlertTriangle, Download, RefreshCw } from "lucide-react";

interface RatingData {
  name: string;
  totalPoints: number;
  homeworkPoints: number;
  inClassPoints: number;
  hasDebt: boolean;
  position?: number;
}

interface RatingTableProps {
  fileUrl: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function RatingTable({ fileUrl, autoRefresh = true, refreshInterval = 60000 }: RatingTableProps) {
  const [data, setData] = useState<RatingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Парсинг HTML таблицы рейтинга
  const parseRatingTable = (html: string): RatingData[] => {
    const results: RatingData[] = [];
    const tableMatch = html.match(/<table[^>]*>[\s\S]*?<\/table>/i);
    
    if (!tableMatch) {
      console.warn('No table found in HTML');
      return [];
    }

    const tableHtml = tableMatch[0];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let match;
    let isHeader = true;

    while ((match = rowRegex.exec(tableHtml)) !== null) {
      const rowHtml = match[1];
      
      // Пропускаем заголовок
      if (isHeader) {
        isHeader = false;
        continue;
      }

      // Извлекаем ячейки
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      const cells: string[] = [];
      let cellMatch;

      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        // Очищаем HTML теги
        const cellText = cellMatch[1]
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .trim();
        cells.push(cellText);
      }

      // Парсим данные строки
      if (cells.length >= 3) {
        const name = cells[0] || 'Неизвестно';
        const homeworkPoints = parseFloat(cells[1]?.replace(',', '.') || '0') || 0;
        const inClassPoints = parseFloat(cells[2]?.replace(',', '.') || '0') || 0;
        const totalPoints = homeworkPoints + inClassPoints;
        
        // Проверяем на долг (обычно помечается цветом или текстом)
        const hasDebt = rowHtml.includes('debt') || 
                       rowHtml.includes('долг') || 
                       rowHtml.includes('red') ||
                       cells.some(c => c.includes('!') || c.includes('долг'));

        results.push({
          name,
          totalPoints,
          homeworkPoints,
          inClassPoints,
          hasDebt,
        });
      }
    }

    // Сортируем по убыванию баллов и добавляем позиции
    return results
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((item, index) => ({ ...item, position: index + 1 }));
  };

  const fetchRating = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Если ссылка относительная, делаем абсолютной
      const url = fileUrl.startsWith('http') 
        ? fileUrl 
        : `http://nsbonline.ru/${fileUrl}`;
      
      console.log('Fetching rating from:', url);
      
      // В реальном приложении нужен proxy или backend
      // Для демонстрации используем заглушку
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const parsed = parseRatingTable(html);
      
      setData(parsed);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching rating:', err);
      setError('Не удалось загрузить рейтинг. Проверьте доступность nsbonline.ru');
      
      // Демо-данные для примера
      setData([
        { id: 1, name: "Иванов Иван", totalPoints: 85, homeworkPoints: 45, inClassPoints: 40, hasDebt: false, position: 1 },
        { id: 2, name: "Петров Петр", totalPoints: 78, homeworkPoints: 40, inClassPoints: 38, hasDebt: false, position: 2 },
        { id: 3, name: "Сидоров Сидор", totalPoints: 65, homeworkPoints: 35, inClassPoints: 30, hasDebt: true, position: 3 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRating();
    
    if (autoRefresh) {
      const interval = setInterval(fetchRating, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fileUrl]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-white">Рейтинг группы</h2>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-sm text-gray-400">
              Обновлено: {lastUpdated.toLocaleTimeString('ru-RU')}
            </span>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchRating}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </motion.button>
        </div>
      </div>

      {/* Loading */}
      {loading && !data.length && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Загрузка рейтинга...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-900/20 border border-red-800">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Table */}
      {data.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-xl overflow-hidden border border-gray-800"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Студент
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    ДЗ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    На паре
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Всего
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900/50 divide-y divide-gray-800">
                {data.map((student, idx) => (
                  <motion.tr
                    key={student.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`hover:bg-gray-800/50 transition-colors ${
                      student.hasDebt ? 'bg-red-900/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 text-white font-medium">
                        {student.position}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white font-medium">{student.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-400">{student.homeworkPoints}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-400">{student.inClassPoints}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white font-bold text-lg">{student.totalPoints}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.hasDebt ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-800">
                          <AlertTriangle className="w-3 h-3" />
                          Долг
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800">
                          <TrendingUp className="w-3 h-3" />
                          OK
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Download link */}
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
      >
        <Download className="w-4 h-4" />
        Скачать оригинал файла
      </a>
    </div>
  );
}
