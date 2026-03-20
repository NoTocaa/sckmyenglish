// Тип задания
export type TaskType = "in_class" | "homework" | "debt" | "rating_file";

// Одно задание
export interface Task {
  id?: number;
  question: string;
  description?: string;
  fileUrl?: string;
  type: TaskType;
}

// Запись ДЗ на дату
export interface HomeworkEntry {
  id: number;
  date: string;
  group: string;
  tasks: Task[];
}

// Для совместимости
export type DateEntry = HomeworkEntry;

// Полезные файлы
export interface UsefulFile {
  id: number;
  name: string;
  url?: string;
  description?: string;
  category?: string;
}

// Группа студентов
export interface Group {
  id: string;
  name: string;
  page: string;
  course: number;
  archive?: boolean;
}

// ВСЕ группы ФЦТМК ОМГУ (ТОЛЬКО АКТУАЛЬНЫЕ)
export const GROUPS: Group[] = [
  // 1 курс
  { id: "b1", name: "B1", page: "group_b1_fkn1_02_2026.html", course: 1 },
  { id: "b2", name: "B2", page: "group_b2_fkn1_02_2026.html", course: 1 },
  // 3 курс
  { id: "mbs07", name: "МБС-07 (3 курс)", page: "group_mbs07_fkn3_02_2026.htm", course: 3 },
  { id: "mpb06", name: "МПБ-06 (3 курс)", page: "group_mpb06_fkn3_02_2026.html", course: 3 },
];

// Типы заданий
export const TASK_TYPES: Record<TaskType, {
  label: string;
  color: string;
  icon: string;
}> = {
  in_class: { label: "На паре", color: "blue", icon: "📖" },
  homework: { label: "ДЗ", color: "green", icon: "✅" },
  debt: { label: "Долг", color: "red", icon: "⚠️" },
  rating_file: { label: "Рейтинг", color: "yellow", icon: "📊" },
};
