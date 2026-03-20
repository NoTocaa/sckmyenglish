import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Download, RefreshCw, AlertCircle, Table, ExternalLink, Info } from "lucide-react";
import { dateEntries } from "../data/homeworkData";
import { GROUPS } from "../types/homework";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";

// Стили для вертикального текста
const verticalTextStyle: React.CSSProperties = {
  writingMode: 'vertical-rl',
  textOrientation: 'mixed',
  transform: 'rotate(180deg)',
};

interface ColumnInfo {
  key: string;
  label: string;
  type: "points" | "attendance" | "verbs" | "other";
}

interface StudentRow {
  position: number;
  name: string;
  points: Record<string, number | string>; // Может быть числом или строкой (как в Excel)
  cellColors: Record<string, string | undefined>;
  totalPoints?: number; // Опционально - может не вычисляться
  hasDebt: boolean;
  debtType: "light" | "bright" | null;
}

interface RatingFile {
  url: string;
  date: string;
  group: string;
  columns?: ColumnInfo[];
  students?: StudentRow[];
  loaded?: boolean;
  error?: string;
  loading?: boolean;
  sheets?: string[]; // Список листов в файле
  selectedSheet?: string; // Выбранный лист
  allCellColors?: Record<string, Record<number, Record<string, string>>>; // Цвета для всех листов
}

// Уникальный ключ для файла рейтинга
const getFileKey = (file: RatingFile) => `${file.group}_${file.date}_${file.url}`;

// Функция для чтения цветов ячеек через exceljs для ВСЕХ листов
async function readAllCellColors(arrayBuffer: ArrayBuffer): Promise<Record<string, Record<number, Record<string, string>>>> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);
  
  const allColors: Record<string, Record<number, Record<string, string>>> = {};
  
  workbook.worksheets.forEach(worksheet => {
    const sheetColors: Record<number, Record<string, string>> = {};
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Пропускаем заголовок
      
      const rowColors: Record<string, string> = {};
      row.eachCell((cell, colNumber) => {
        const fillColor = cell.fill?.fgColor?.argb || cell.fill?.bgColor?.argb;
        if (fillColor && typeof fillColor === 'string') {
          const rgb = fillColor.toUpperCase().replace(/[^0-9A-F]/g, '');
          if (rgb.length === 8) {
            const r = parseInt(rgb.substring(2, 4), 16);
            const g = parseInt(rgb.substring(4, 6), 16);
            const b = parseInt(rgb.substring(6, 8), 16);
            
            // Сохраняем ТОЛЬКО красный цвет (ярко-красный И светло-красный)
            // Ярко-красный: FFFF0000 (R=255, G=0, B=0)
            // Светло-красный: FFFFCCCC (R=255, G=204, B=204)
            const isBrightRed = (r === 255 && g === 0 && b === 0);
            const isLightRed = (r === 255 && g === 204 && b === 204);
            
            if (isBrightRed || isLightRed) {
              rowColors[`col_${colNumber - 1}`] = fillColor;
              console.log(`RED CELL ${worksheet.name} [${rowNumber}:${colNumber}]: ${fillColor} R:${r} G:${g} B:${b}`);
            }
          }
        }
      });
      
      if (Object.keys(rowColors).length > 0) {
        sheetColors[rowNumber - 1] = rowColors;
      }
    });
    
    if (Object.keys(sheetColors).length > 0) {
      allColors[worksheet.name] = sheetColors;
    }
  });
  
  console.log('All RED cell colors:', allColors);
  return allColors;
}

export function Rating() {
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  // Храним уникальный ключ файла вместо индекса
  const [expandedFileKey, setExpandedFileKey] = useState<string | null>(null);
  const [ratingFiles, setRatingFiles] = useState<RatingFile[]>([]);
  // Кэш данных: key = fileKey_sheetName
  const [loadedData, setLoadedData] = useState<Record<string, { columns: ColumnInfo[]; students: StudentRow[]; sheets: string[]; allCellColors: Record<string, Record<number, Record<string, string>>> }>>({});

  useEffect(() => {
    const files: RatingFile[] = [];
    dateEntries.forEach(entry => {
      entry.tasks.forEach(task => {
        if (task.type === 'rating_file' && task.fileUrl) {
          // Добавляем только если есть fileUrl
          files.push({
            url: task.fileUrl!,
            date: entry.date,
            group: entry.group,
          });
        }
      });
    });
    setRatingFiles(files);
  }, []);

  const parseXLSX = (arrayBuffer: ArrayBuffer, sheetName?: string, allCellColors?: Record<string, Record<number, Record<string, string>>>): { columns: ColumnInfo[]; students: StudentRow[]; sheets: string[] } => {
    // Читаем с опциями для стилей
    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      cellStyles: true,
      cellNF: true,
      cellText: true,
    });
    
    // Получаем список всех листов
    const sheets = workbook.SheetNames;
    
    // Выбираем нужный лист или первый по умолчанию
    const targetSheet = sheetName || sheets[0];
    const firstSheet = workbook.Sheets[targetSheet];
    
    if (!firstSheet) {
      throw new Error(`Sheet "${targetSheet}" not found`);
    }
    
    // Получаем все данные без изменений - raw: true для сырых значений
    const jsonData = XLSX.utils.sheet_to_json<any>(firstSheet, { 
      header: 1,
      raw: true, // Берем сырые значения из Excel
      defval: '', // Пустые ячейки как пустые строки
    });

    // Первая строка - заголовки колонок (берем ВСЕ включая пустые)
    const headerRow: string[] = jsonData[0]?.map((cell: any) => {
      if (cell === null || cell === undefined) return '';
      return String(cell).trim();
    }) || [];
    
    // Все остальные строки - данные студентов (запоминаем оригинальные индексы)
    const studentRowsWithIndex = jsonData.slice(1)
      .map((row: any[], idx: number) => ({ row, originalIdx: idx + 1 })) // +1 потому что 0 = заголовки
      .filter(({ row }) => {
        // Оставляем строку если в ней есть хоть одно непустое значение
        return row && row.length > 0 && row.some((cell: any) =>
          cell !== null && cell !== undefined && cell !== ''
        );
      });

    // Создаем колонки для ВСЕХ заголовков
    const columns: ColumnInfo[] = headerRow.map((label, idx) => ({
      key: `col_${idx}`,
      label: label || '',
      type: 'other' as const,
    }));

    // Парсим студентов - берем ВСЕ строки с данными
    const students: StudentRow[] = studentRowsWithIndex
      .map(({ row, originalIdx }, idx) => {
        const points: Record<string, number | string> = {};
        const cellColors: Record<string, string | undefined> = {};
        let hasDebt = false;
        let debtType: StudentRow['debtType'] = null;

        // Проходим по ВСЕМ колонкам
        const maxCols = Math.max(columns.length, row.length);

        for (let colIdx = 0; colIdx < maxCols; colIdx++) {
          const colKey = `col_${colIdx}`;
          const cellValue = row[colIdx] ?? '';
          
          points[colKey] = cellValue;

          // Берем цвет из exceljs для ТЕКУЩЕГО листа
          const sheetColors = allCellColors?.[targetSheet];
          const rowColors = sheetColors?.[originalIdx];
          if (rowColors && rowColors[colKey]) {
            cellColors[colKey] = rowColors[colKey];
            
            // Проверяем на красный цвет
            const rgb = rowColors[colKey].toUpperCase().replace(/[^0-9A-F]/g, '');
            if (rgb.length === 8) {
              const r = parseInt(rgb.substring(2, 4), 16);
              const g = parseInt(rgb.substring(4, 6), 16);
              const b = parseInt(rgb.substring(6, 8), 16);
              
              // Ярко-красный: FFFF0000 (R=255, G=0, B=0)
              const isBrightRed = (r === 255 && g === 0 && b === 0);
              // Светло-красный: FFFFCCCC (R=255, G=204, B=204)
              const isLightRed = (r === 255 && g === 204 && b === 204);
              
              if (isBrightRed || isLightRed) {
                hasDebt = true;
                debtType = isBrightRed ? 'bright' : 'light';
              }
            }
          }
        }

        return {
          position: idx + 1,
          name: String(row[0] ?? row[1] ?? 'Неизвестно'),
          points,
          cellColors,
          totalPoints: 0,
          hasDebt,
          debtType,
        };
      });

    if (students.length === 0) {
      console.warn('No students found in XLSX. Headers:', headerRow);
      throw new Error('No student data found in file');
    }

    return { columns, students, sheets };
  };

  const loadXLSX = async (fileUrl: string, sheetName?: string): Promise<{ columns: ColumnInfo[]; students: StudentRow[]; sheets: string[]; allCellColors: Record<string, Record<number, Record<string, string>>> }> => {
    // Преобразуем внешнюю ссылку в proxy путь для dev-режима
    // http://nsbonline.ru/files/... -> /api/rating/files/...
    const proxyUrl = fileUrl.replace(/^http:\/\/nsbonline\.ru/, '/api/rating');

    // Список CORS proxy для fallback (для production)
    const fallbackProxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(fileUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(fileUrl)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(fileUrl)}`,
    ];

    // Пробуем сначала прямой запрос (может работать в production на том же домене)
    const urlsToTry = [
      { url: proxyUrl, name: 'Vite Proxy' },
      { url: fileUrl, name: 'Direct' },
      ...fallbackProxies.map((url, i) => ({ url, name: `Fallback ${i + 1}` })),
    ];

    let lastError: Error | null = null;

    for (const { url, name } of urlsToTry) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();

        if (arrayBuffer.byteLength === 0) {
          throw new Error('Empty file (0 bytes)');
        }

        // Читаем цвета для ВСЕХ листов сразу
        const allCellColors = await readAllCellColors(arrayBuffer);
        
        // Парсим данные через xlsx
        const { columns, students, sheets } = parseXLSX(arrayBuffer, sheetName, allCellColors);

        return { columns, students, sheets, allCellColors };
      } catch (error) {
        lastError = error as Error;
        // Пробуем следующий URL
      }
    }

    // Все попытки не сработали
    throw lastError || new Error('All connection methods failed');
  };

  useEffect(() => {
    if (expandedFileKey === null) return;

    // Находим файл по ключу
    const file = ratingFiles.find(f => getFileKey(f) === expandedFileKey);
    if (!file || !file.url) return;

    // Определяем текущий лист (первый по умолчанию)
    const currentSheet = file.selectedSheet;
    
    // Ключ кэша: fileKey_sheetName
    const cacheKey = `${expandedFileKey}_${currentSheet || 'default'}`;
    
    // Проверяем есть ли уже загруженные данные для ЭТОГО ЛИСТА
    if (loadedData[cacheKey]?.students) {
      return; // Данные уже загружены для этого листа
    }

    // Проверяем не идет ли уже загрузка
    if (file.loading) return;

    setRatingFiles(prev => prev.map((f) =>
      getFileKey(f) === expandedFileKey ? { ...f, loading: true } : f
    ));

    loadXLSX(file.url, currentSheet)
      .then(({ columns, students, sheets, allCellColors }) => {
        // Сохраняем данные в кэш с ключом листа
        setLoadedData(prev => ({
          ...prev,
          [cacheKey]: { columns, students, sheets, allCellColors }
        }));
        
        // Обновляем файл
        setRatingFiles(prev => prev.map((f) =>
          getFileKey(f) === expandedFileKey ? { 
            ...f, 
            sheets,
            allCellColors,
            columns,
            students,
            selectedSheet: currentSheet,
            loaded: true, 
            loading: false, 
            error: undefined 
          } : f
        ));
      })
      .catch((err) => {
        console.error('Failed to load XLSX:', err);
        setRatingFiles(prev => prev.map((f) =>
          getFileKey(f) === expandedFileKey ? {
            ...f,
            error: `Не удалось загрузить (${err instanceof Error ? err.message : 'ошибка'})`,
            loaded: false,
            loading: false
          } : f
        ));
      });
  }, [expandedFileKey, ratingFiles, loadedData]);

  const filteredFiles = selectedGroup 
    ? ratingFiles.filter(f => f.group === selectedGroup)
    : ratingFiles;

  const handleDirectDownload = (url: string) => {
    window.open(url, '_blank');
  };

  const handleSheetChange = (fileKey: string, sheetName: string) => {
    // Сбрасываем кэш для этого листа
    const cacheKey = `${fileKey}_${sheetName}`;
    setLoadedData(prev => {
      const newData = { ...prev };
      delete newData[cacheKey];
      return newData;
    });
    
    setRatingFiles(prev => prev.map(f => {
      if (getFileKey(f) === fileKey) {
        return {
          ...f,
          selectedSheet: sheetName,
          loaded: false,
          loading: false,
          error: undefined,
        };
      }
      return f;
    }));
  };

  const getCellColor = (value: number | string, debtType?: StudentRow['debtType'], cellFill?: string) => {
    // If we have cell fill color from XLSX, use it (приоритет цвету из Excel)
    if (cellFill) {
      const rgb = cellFill.toUpperCase().replace(/[^0-9A-F]/g, '');
      if (rgb.length === 8) {
        const r = parseInt(rgb.substring(2, 4), 16);
        const g = parseInt(rgb.substring(4, 6), 16);
        const b = parseInt(rgb.substring(6, 8), 16);

        // Ярко-красный: FFFF0000 (R=255, G=0, B=0)
        if (r === 255 && g === 0 && b === 0) {
          return 'bg-red-600/30 text-red-400 font-bold';
        }
        // Светло-красный: FFFFCCCC (R=255, G=204, B=204)
        if (r === 255 && g === 204 && b === 204) {
          return 'bg-red-900/20 text-red-500';
        }
      }
    }

    // Нет цвета в Excel - проверяем значение
    let numValue: number;
    if (typeof value === 'number') {
      numValue = value;
    } else if (value === '' || value === null || value === undefined) {
      return 'text-gray-500';
    } else {
      numValue = Number(String(value).trim());
    }

    // 1 = выполнено → зелёный
    if (numValue === 1) {
      return 'bg-green-900/20 text-green-400 font-bold';
    }

    // 0 или пусто → нейтрально
    return 'text-gray-400';
  };

  const getColumnIcon = (type: ColumnInfo['type']) => {
    switch (type) {
      case 'attendance': return '📅';
      case 'verbs': return '📖';
      case 'points': return '⭐';
      default: return '📊';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <div>
              <h1 className="text-3xl font-bold text-white">Рейтинг</h1>
              <p className="text-gray-400 text-sm">Таблица персональных баллов</p>
            </div>
          </div>

          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
          >
            <option value="">Все группы</option>
            {GROUPS.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6 p-4 rounded-xl bg-blue-900/20 border border-blue-800"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="text-blue-300 text-sm">
            <p className="font-medium mb-2">Как читать таблицу:</p>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-blue-200 mb-1">📊 Значения в ячейках:</p>
                <ul className="space-y-1 text-xs text-blue-400">
                  <li>• <span className="text-white font-medium">1</span> — задание выполнено / посещение было</li>
                  <li>• <span className="text-white font-medium">0</span> — задание не выполнено / отсутствие</li>
                  <li>• <span className="text-white font-medium">Пусто</span> — задание ещё не проверялось</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-blue-200 mb-1">🎨 Цвета ячеек (из Excel):</p>
                <ul className="space-y-1 text-xs text-blue-400">
                  <li>• <span className="inline-flex items-center gap-1"><span className="w-3 h-3 bg-red-600/30 rounded border border-red-500/50"></span>Ярко-красный</span> — долг (закрыть самому!)</li>
                  <li>• <span className="inline-flex items-center gap-1"><span className="w-3 h-3 bg-red-900/20 rounded border border-red-700/30"></span>Светло-красный</span> — долг (закроется автоматически)</li>
                  <li>• <span className="inline-flex items-center gap-1"><span className="w-3 h-3 bg-green-600/30 rounded border border-green-500/50"></span>Зелёный</span> — выполнено / посещение</li>
                </ul>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-800/50">
              <p className="font-medium text-blue-200 mb-1">❗ Важно:</p>
              <ul className="space-y-1 text-xs text-blue-400">
                <li>• <span className="text-white">Ярко-красные ячейки</span> — нужно закрыть самому</li>
                <li>• <span className="text-white">Светло-красные ячейки</span> — закроются автоматически</li>
                <li>• <span className="text-white">Данные отображаются точно как в Excel файле</span></li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Files List */}
      <div className="space-y-4">
        {filteredFiles.map((file) => {
          const fileKey = getFileKey(file);
          const isExpanded = expandedFileKey === fileKey;
          const idx = filteredFiles.findIndex(f => getFileKey(f) === fileKey);
          
          // Ключ кэша: fileKey_sheetName
          const currentSheet = file.selectedSheet;
          const cacheKey = `${fileKey}_${currentSheet || 'default'}`;
          
          // Получаем загруженные данные для этого файла и листа
          const data = loadedData[cacheKey];
          const sheets = data?.sheets || file.sheets;
          const students = data?.students || file.students;
          const columns = data?.columns || file.columns;
          const selectedSheet = file.selectedSheet || (sheets && sheets.length > 0 ? sheets[0] : undefined);
          
          return (
          <motion.div
            key={fileKey}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Рейтинг</p>
                    <p className="text-gray-500 text-sm">
                      {file.date} • {GROUPS.find(g => g.id === file.group)?.name || file.group}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedFileKey(isExpanded ? null : fileKey)}
                    disabled={file.loading || !file.url}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white transition-colors"
                  >
                    {file.loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Table className="w-4 h-4" />
                    )}
                    {isExpanded ? "Свернуть" : "Показать таблицу"}
                  </button>
                  {file.url ? (
                    <button
                      onClick={() => handleDirectDownload(file.url)}
                      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors"
                      title="Скачать файл"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="px-3 py-2 rounded-lg bg-gray-800 text-gray-500 text-sm">
                      Нет файла
                    </span>
                  )}
                </div>
              </div>

              {/* Sheet tabs */}
              {isExpanded && sheets && sheets.length > 1 && (
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-400">Лист:</span>
                  {sheets.map((sheet) => (
                    <button
                      key={sheet}
                      onClick={() => handleSheetChange(fileKey, sheet)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedSheet === sheet
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {sheet}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Table */}
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="border-t border-gray-800"
              >
                <div className="p-6">
                  {!file.url && (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                      <p className="text-yellow-400 mb-2">Файл рейтинга недоступен</p>
                      <p className="text-gray-500 text-sm">
                        Преподаватель ещё не загрузил таблицу баллов для этой даты
                      </p>
                    </div>
                  )}

                  {file.url && file.loading && (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                      <p className="text-gray-400 ml-3">Загрузка листа...</p>
                    </div>
                  )}

                  {file.error && (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <p className="text-red-400 mb-2">{file.error}</p>
                      <div className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                        <p>Возможные причины:</p>
                        <ul className="text-left list-disc list-inside mt-2 space-y-1">
                          <li>Файл недоступен на сервере nsbonline.ru</li>
                          <li>Проблемы с CORS (попробуйте открыть в другом браузере)</li>
                          <li>Файл был перемещён или удалён</li>
                        </ul>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDirectDownload(file.url)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Открыть файл напрямую
                        </button>
                        <button
                          onClick={() => {
                            // Сбросить ошибку и попробовать снова
                            setRatingFiles(prev => prev.map((f) =>
                              getFileKey(f) === fileKey ? { ...f, error: undefined, loaded: false } : f
                            ));
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Попробовать снова
                        </button>
                      </div>
                    </div>
                  )}

                  {file.loaded && !file.error && !students && (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                      <p className="text-yellow-400 mb-2">Не удалось распарсить файл</p>
                      <p className="text-gray-500 text-sm mb-4">
                        Файл загружен, но не содержит данных в ожидаемом формате
                      </p>
                      <button
                        onClick={() => handleDirectDownload(file.url)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Открыть файл напрямую
                      </button>
                    </div>
                  )}

                  {students && students.length === 0 && (
                    <p className="text-center text-gray-500 py-8">Нет данных в таблице</p>
                  )}

                  {students && students.length > 0 && (
                    <div className="overflow-x-auto max-w-full">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-400 uppercase sticky left-0 bg-gray-900 min-w-[40px]">#</th>
                            {columns?.map((col, colIdx) => (
                              <th
                                key={col.key}
                                className={`px-2 py-3 text-center text-xs font-medium text-gray-400 uppercase whitespace-nowrap min-w-[80px] ${
                                  colIdx === 0 ? 'sticky left-10 bg-gray-900' : ''
                                }`}
                              >
                                <div className="flex items-center justify-center" style={{ height: '100px' }}>
                                  <span style={col.label.length > 15 ? verticalTextStyle : {}}>
                                    {col.label}
                                  </span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((student, i) => (
                            <motion.tr
                              key={student.name + i}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: i * 0.02 }}
                              className={`border-b border-gray-800/50 ${
                                student.debtType === 'bright' ? 'bg-red-600/10' : ''
                              }`}
                            >
                              <td className="px-2 py-2 sticky left-0 bg-gray-900">
                                <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs">
                                  {student.position}
                                </span>
                              </td>
                              {columns?.map((col, colIdx) => {
                                const cellValue = student.points[col.key];
                                const isEmpty = cellValue === '' || cellValue === null || cellValue === undefined;
                                
                                return (
                                  <td
                                    key={col.key}
                                    className={`px-2 py-2 text-center whitespace-nowrap ${
                                      colIdx === 0 ? 'sticky left-10 bg-gray-900 text-white font-medium' : ''
                                    } ${getCellColor(
                                      cellValue,
                                      student.debtType,
                                      student.cellColors[col.key]
                                    )}`}
                                  >
                                    {isEmpty ? '' : String(cellValue)}
                                  </td>
                                );
                              })}
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {file.students && file.students.length === 0 && (
                    <p className="text-center text-gray-500 py-8">Нет данных в таблице</p>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        );})}
      </div>

      {/* Empty state */}
      {filteredFiles.length === 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center py-12 rounded-xl bg-gray-900 border border-gray-800"
        >
          <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Нет файлов рейтинга</p>
          <p className="text-gray-500 text-sm mt-2">
            Рейтинг добавляется преподавателем не каждую пару
          </p>
        </motion.div>
      )}
    </div>
  );
}
