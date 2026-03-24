import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, ChevronRight, X, Save, FileText, Link2 } from "lucide-react";
import { useHomeworkData } from "../../hooks/useHomeworkData";
import type { HomeworkEntry, Task, TaskType } from "../../types/homework";
import { GROUPS, TASK_TYPES } from "../../types/homework";

export function AdminHomework() {
  const { entries, addEntry, updateEntry, deleteEntry } = useHomeworkData();
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HomeworkEntry | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    date: "",
    group: "b1",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEntry: HomeworkEntry = {
      id: Date.now(),
      date: formData.date,
      group: formData.group,
      tasks: [],
    };

    if (editingEntry) {
      updateEntry(editingEntry.id, { ...newEntry, id: editingEntry.id, tasks: editingEntry.tasks });
    } else {
      addEntry(newEntry);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ date: "", group: "b1" });
    setEditingEntry(null);
    setIsModalOpen(false);
  };

  const handleEdit = (entry: HomeworkEntry) => {
    setEditingEntry(entry);
    setFormData({ date: entry.date, group: entry.group });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Удалить эту запись?")) {
      deleteEntry(id);
    }
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const selectedEntry = entries.find(e => e.id === selectedEntryId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Домашние задания</h1>
          <p className="text-gray-400 mt-1">Управление заданиями</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          Добавить ДЗ
        </motion.button>
      </div>

      {/* List */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Список записей */}
        <div className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">Записи</h2>
          </div>
          <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
            {entries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setSelectedEntryId(entry.id)}
                className={`w-full px-6 py-4 text-left hover:bg-gray-800/50 transition-colors ${
                  selectedEntryId === entry.id ? 'bg-gray-800/50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{entry.date}</p>
                    <p className="text-gray-500 text-sm">
                      {(entry.tasks || []).length} заданий • {entry.group}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(entry); }}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Просмотр/редактирование заданий */}
        <div className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {selectedEntry ? `Задания на ${selectedEntry.date}` : 'Выберите запись'}
            </h2>
            {selectedEntry && (
              <button
                onClick={handleAddTask}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                <Plus className="w-4 h-4" />
                Добавить задание
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
            {selectedEntry ? (
              selectedEntry.tasks && selectedEntry.tasks.length > 0 ? (
                selectedEntry.tasks.map((task, idx) => {
                  const typeConfig = TASK_TYPES[task.type];
                  return (
                    <div key={task.id || idx} className="p-4 hover:bg-gray-800/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{typeConfig.icon}</span>
                            <span className="text-white font-medium">{task.question}</span>
                          </div>
                          {task.description && (
                            <p className="text-gray-400 text-sm line-clamp-2">{task.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleEditTask(task)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-12">Нет заданий. Добавьте первое.</p>
              )
            ) : (
              <p className="text-gray-500 text-center py-12">Выберите запись слева</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Create/Edit Entry */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50" onClick={resetForm} />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 p-6"
            >
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {editingEntry ? 'Редактировать' : 'Новое ДЗ'}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Дата</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="19.03.2026"
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Группа</label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                  >
                    {GROUPS.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={resetForm} className="flex-1 px-4 py-2 rounded-lg border border-gray-700 text-gray-300">
                    Отмена
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white">
                    {editingEntry ? 'Сохранить' : 'Создать'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Add/Edit Task */}
      <AnimatePresence>
        {isTaskModalOpen && selectedEntry && (
          <TaskFormModal
            entry={selectedEntry}
            task={selectedTask}
            onClose={() => { setIsTaskModalOpen(false); setSelectedTask(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Modal Component for Task Form
function TaskFormModal({ entry, task, onClose }: { entry: HomeworkEntry; task: Task | null; onClose: () => void }) {
  const { updateEntry } = useHomeworkData();
  
  const [formData, setFormData] = useState({
    question: task?.question || '',
    description: task?.description || '',
    type: task?.type || 'homework' as TaskType,
    fileUrl: task?.fileUrl || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTask: Task = {
      id: task?.id || Date.now(),
      ...formData,
    };

    let newTasks: Task[];
    if (task) {
      newTasks = entry.tasks.map(t => t.id === task.id ? newTask : t);
    } else {
      newTasks = [...(entry.tasks || []), newTask];
    }

    updateEntry(entry.id, { ...entry, tasks: newTasks });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-lg rounded-2xl bg-gray-900 border border-gray-800 p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {task ? 'Редактировать задание' : 'Новое задание'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Тип</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as TaskType })}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
            >
              {Object.entries(TASK_TYPES).map(([key, config]) => (
                <option key={key} value={key}>{config.icon} {config.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Название</label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Например: Задание 1"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Описание (текст)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Описание задания..."
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Ссылка на файл</label>
            <input
              type="text"
              value={formData.fileUrl}
              onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
              placeholder="http://nsbonline.ru/files/..."
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-700 text-gray-300">
              Отмена
            </button>
            <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white inline-flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              Сохранить
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
