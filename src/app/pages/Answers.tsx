import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Filter } from "lucide-react";
import { HomeworkDay } from "../components/HomeworkDay";
import { dateEntries } from "../data/homeworkData";
import { GROUPS } from "../types/homework";

export function Answers() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [openTypes, setOpenTypes] = useState<Record<string, boolean>>({});

  // Фильтр по группам
  const filteredEntries = useMemo(() => {
    if (selectedGroup === "all") return dateEntries;
    return dateEntries.filter(entry => entry.group === selectedGroup);
  }, [selectedGroup]);

  const toggleType = (type: string) => {
    setOpenTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleDateSelect = (idx: number) => {
    if (selectedDate !== idx) {
      setOpenTypes({ homework: true, in_class: true });
    } else {
      setOpenTypes({});
    }
    setSelectedDate(selectedDate === idx ? null : idx);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold text-white">Домашние задания</h1>
              <p className="text-gray-400 text-sm">
                {filteredEntries.length} записей
              </p>
            </div>
          </div>

          {/* Выбор группы */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Все группы</option>
              {GROUPS.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Список ДЗ */}
      <div className="space-y-4">
        {filteredEntries.map((entry, idx) => (
          <HomeworkDay
            key={entry.id}
            entry={entry}
            index={idx}
            isSelected={selectedDate === idx}
            onSelect={() => handleDateSelect(idx)}
            openTypes={openTypes}
            onToggleType={toggleType}
          />
        ))}
      </div>

      {/* Пусто */}
      {filteredEntries.length === 0 && (
        <div className="text-center py-12 rounded-xl bg-gray-900 border border-gray-800">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Нет заданий для этой группы</p>
        </div>
      )}
    </div>
  );
}
