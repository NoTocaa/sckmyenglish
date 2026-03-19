import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Calendar, ExternalLink } from "lucide-react";
import type { HomeworkEntry, Task, TaskType } from "../types/homework";
import { TASK_TYPES } from "../types/homework";

interface TaskCardProps {
  task: Task;
}

function TaskCard({ task }: TaskCardProps) {
  const config = TASK_TYPES[task.type];
  
  // Проверяем есть ли HTML ссылки в описании
  const hasHtmlLinks = task.description?.includes('<a');
  
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="p-4 rounded-lg bg-gray-900 border border-gray-800"
    >
      <div className="space-y-3">
        {/* Заголовок */}
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.icon}</span>
          <span className="text-white font-medium">{task.question}</span>
        </div>

        {/* Описание */}
        {task.description && (
          <div className="text-gray-300 text-sm leading-relaxed">
            {hasHtmlLinks ? (
              /* Рендерим HTML с ссылками - стилизуем ссылки ВНУТРИ текста */
              <div
                dangerouslySetInnerHTML={{ 
                  __html: task.description.replace(
                    /<a href="([^"]+)"[^>]*>([^<]*)<\/a>/g,
                    '<a href="$1" target="_blank" class="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1 bg-blue-600/20 px-2 py-0.5 rounded mx-1">🔗 $2</a>'
                  )
                }}
              />
            ) : (
              /* Просто текст */
              <p>{task.description}</p>
            )}
          </div>
        )}

        {/* Кнопка файла если есть fileUrl и нет HTML ссылок */}
        {task.fileUrl && !hasHtmlLinks && (
          <a
            href={task.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Открыть файл
          </a>
        )}
      </div>
    </motion.div>
  );
}

interface GroupedTasks {
  in_class: Task[];
  homework: Task[];
  debt: Task[];
  rating_file: Task[];
}

function groupTasksByType(tasks: Task[] | undefined): GroupedTasks {
  const grouped: GroupedTasks = { in_class: [], homework: [], debt: [], rating_file: [] };
  if (!tasks) return grouped;
  tasks.forEach(task => {
    grouped[task.type || "homework"].push(task);
  });
  return grouped;
}

interface HomeworkDayProps {
  entry: HomeworkEntry;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  openTypes: Record<string, boolean>;
  onToggleType: (type: string) => void;
}

export function HomeworkDay({ entry, index, isSelected, onSelect, openTypes, onToggleType }: HomeworkDayProps) {
  const grouped = groupTasksByType(entry.tasks);

  const renderSection = (type: TaskType, label: string, icon: string, color: string) => {
    const tasks = grouped[type];
    if (tasks.length === 0) return null;

    const isOpen = openTypes[type];
    const bgColors: Record<string, string> = {
      in_class: "bg-blue-900/20 border-blue-800/50",
      homework: "bg-green-900/20 border-green-800/50",
      debt: "bg-red-900/20 border-red-800/50",
      rating_file: "bg-yellow-900/20 border-yellow-800/50",
    };

    return (
      <div className={`border rounded-lg overflow-hidden mb-3 ${bgColors[type]}`}>
        <button
          onClick={() => onToggleType(type)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{icon}</span>
            <span className="text-white font-medium">{label}</span>
            <span className="text-gray-500 text-sm">({tasks.length})</span>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? "rotate-90" : ""}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 py-3 space-y-3">
                {tasks.map((task, idx) => (
                  <TaskCard key={task.id || idx} task={task} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="border border-gray-800 rounded-xl overflow-hidden"
    >
      <button
        onClick={onSelect}
        className="w-full flex items-center justify-between px-6 py-4 bg-gray-900/50 hover:bg-gray-900"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <span className="text-white font-medium block">{entry.date}</span>
            <span className="text-gray-500 text-sm">{(entry.tasks || []).length} заданий</span>
          </div>
        </div>
        <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${isSelected ? "rotate-90" : ""}`} />
      </button>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-800 px-6 py-4 bg-gray-900/30">
              {renderSection("rating_file", "Рейтинг", "📊", "yellow")}
              {renderSection("in_class", "На паре", "📖", "blue")}
              {renderSection("homework", "ДЗ", "✅", "green")}
              {renderSection("debt", "Долг", "⚠️", "red")}

              {(!entry.tasks || entry.tasks.length === 0) && (
                <p className="text-gray-500 text-center py-8">Нет заданий</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
