import { ChevronRight } from "lucide-react";
import type { DateEntry } from "../types/homework";

interface HomeworkListProps {
  entries: DateEntry[];
  selectedDate: number | null;
  onSelectDate: (id: number | null) => void;
}

export function HomeworkList({ entries, selectedDate, onSelectDate }: HomeworkListProps) {
  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div key={entry.id} className="border border-gray-800 rounded">
          <button
            onClick={() => onSelectDate(selectedDate === entry.id ? null : entry.id)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-900 transition-colors"
          >
            <span className="text-white flex items-center gap-3">
              {entry.date}
              {entry.file && (
                <a
                  href={entry.file}
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm text-blue-400 hover:text-blue-300 underline"
                >
                  Скачать
                </a>
              )}
            </span>
            <ChevronRight
              className={`w-5 h-5 text-gray-500 transition-transform ${
                selectedDate === entry.id ? "rotate-90" : ""
              }`}
            />
          </button>

          {selectedDate === entry.id && (
            <div className="border-t border-gray-800 px-6 py-4 space-y-3">
              {entry.answers.map((answer) => (
                <div key={answer.id} className="py-2">
                  <p className="text-gray-400 text-sm mb-1">{answer.question}</p>
                  <p
                    className="text-white"
                    dangerouslySetInnerHTML={{ __html: answer.answer }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
