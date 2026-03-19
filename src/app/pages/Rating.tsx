import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Download, RefreshCw, AlertCircle, Table, ExternalLink } from "lucide-react";
import { dateEntries } from "../data/homeworkData";
import { GROUPS } from "../types/homework";
import * as XLSX from "xlsx";

interface RatingData {
  position?: number;
  name: string;
  homeworkPoints: number;
  inClassPoints: number;
  totalPoints: number;
  hasDebt: boolean;
}

interface RatingFile {
  url: string;
  date: string;
  group: string;
  data?: RatingData[];
  loaded?: boolean;
  error?: string;
  loading?: boolean;
}

export function Rating() {
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [expandedFile, setExpandedFile] = useState<number | null>(null);
  const [ratingFiles, setRatingFiles] = useState<RatingFile[]>([]);

  useEffect(() => {
    const files: RatingFile[] = [];
    dateEntries.forEach(entry => {
      entry.tasks.forEach(task => {
        if (task.type === 'rating_file' && task.fileUrl) {
          files.push({
            url: task.fileUrl,
            date: entry.date,
            group: entry.group,
          });
        }
      });
    });
    setRatingFiles(files);
  }, []);

  const loadXLSX = async (fileUrl: string): Promise<RatingData[]> => {
    try {
      // Пробуем загрузить напрямую через fetch
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<any>(firstSheet);

      const parsed: RatingData[] = jsonData
        .filter((row, idx) => idx > 0 && Object.values(row).length > 1)
        .map((row) => {
          const values = Object.values(row);
          const name = String(values[0] || 'Неизвестно');
          const homeworkPoints = parseFloat(String(values[1] || 0)) || 0;
          const inClassPoints = parseFloat(String(values[2] || 0)) || 0;
          const totalPoints = homeworkPoints + inClassPoints;
          
          return {
            name,
            homeworkPoints,
            inClassPoints,
            totalPoints,
            hasDebt: totalPoints < 50,
          };
        })
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((item, idx) => ({ ...item, position: idx + 1 }));

      return parsed;
    } catch (error) {
      console.error('XLSX load error:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (expandedFile === null) return;

    const file = ratingFiles[expandedFile];
    if (!file || file.loaded || file.error || file.loading) return;

    setRatingFiles(prev => prev.map((f, i) => 
      i === expandedFile ? { ...f, loading: true } : f
    ));

    loadXLSX(file.url)
      .then(data => {
        setRatingFiles(prev => prev.map((f, i) => 
          i === expandedFile ? { ...f, data, loaded: true, loading: false } : f
        ));
      })
      .catch((err) => {
        console.error('Failed to load XLSX:', err);
        setRatingFiles(prev => prev.map((f, i) => 
          i === expandedFile ? { 
            ...f, 
            error: `Не удалось загрузить (${err instanceof Error ? err.message : 'ошибка'})`, 
            loaded: true, 
            loading: false 
          } : f
        ));
      });
  }, [expandedFile, ratingFiles]);

  const filteredFiles = selectedGroup 
    ? ratingFiles.filter(f => f.group === selectedGroup)
    : ratingFiles;

  const handleDirectDownload = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
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
        <p className="text-blue-300 text-sm">
          💡 Нажмите <strong>"Показать таблицу"</strong> чтобы загрузить XLSX файл
        </p>
        <p className="text-blue-400 text-xs mt-2">
          ⚠️ Если загрузка не работает - файл откроется в новой вкладке
        </p>
      </motion.div>

      {/* Files List */}
      <div className="space-y-4">
        {filteredFiles.map((file, idx) => (
          <motion.div
            key={file.url + idx}
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
                  {file.loaded && file.data && (
                    <span className="text-sm text-gray-400">
                      {file.data.length} студентов
                    </span>
                  )}
                  <button
                    onClick={() => setExpandedFile(expandedFile === idx ? null : idx)}
                    disabled={file.loading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white transition-colors"
                  >
                    {file.loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Table className="w-4 h-4" />
                    )}
                    {expandedFile === idx ? "Свернуть" : "Показать таблицу"}
                  </button>
                  <button
                    onClick={() => handleDirectDownload(file.url)}
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors"
                    title="Скачать файл"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            {expandedFile === idx && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="border-t border-gray-800"
              >
                <div className="p-6">
                  {file.loading && (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                      <p className="text-gray-400 ml-3">Загрузка таблицы...</p>
                    </div>
                  )}

                  {file.error && (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <p className="text-red-400 mb-2">{file.error}</p>
                      <p className="text-gray-500 text-sm mb-4">
                        Файл будет открыт в новой вкладке
                      </p>
                      <button
                        onClick={() => handleDirectDownload(file.url)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Открыть файл
                      </button>
                    </div>
                  )}

                  {file.data && file.data.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">#</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Студент</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">ДЗ</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">На паре</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Всего</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Статус</th>
                          </tr>
                        </thead>
                        <tbody>
                          {file.data.map((student, i) => (
                            <motion.tr
                              key={student.name + i}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: i * 0.03 }}
                              className={`border-b border-gray-800/50 ${
                                student.hasDebt ? 'bg-red-900/10' : ''
                              }`}
                            >
                              <td className="px-4 py-3">
                                <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs">
                                  {student.position}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-white font-medium">{student.name}</td>
                              <td className="px-4 py-3 text-gray-400">{student.homeworkPoints}</td>
                              <td className="px-4 py-3 text-gray-400">{student.inClassPoints}</td>
                              <td className="px-4 py-3">
                                <span className="text-white font-bold">{student.totalPoints}</span>
                              </td>
                              <td className="px-4 py-3">
                                {student.hasDebt ? (
                                  <span className="px-2 py-1 rounded text-xs bg-red-900/30 text-red-400">Долг</span>
                                ) : (
                                  <span className="px-2 py-1 rounded text-xs bg-green-900/30 text-green-400">OK</span>
                                )}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {file.data && file.data.length === 0 && (
                    <p className="text-center text-gray-500 py-8">Нет данных в таблице</p>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
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
