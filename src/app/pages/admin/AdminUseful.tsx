import { useState } from "react";
import { Plus, Edit2, Trash2, FileText } from "lucide-react";
import type { UsefulFile } from "../../types/homework";
import { usefulFiles } from "../../data/usefulData";

export function AdminUseful() {
  const [files] = useState<UsefulFile[]>(usefulFiles);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Полезные материалы</h1>
          <p className="text-gray-400 mt-1">Управление учебными ресурсами</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Добавить файл
        </button>
      </div>

      {/* Files Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">{file.name}</p>
                {file.category && (
                  <span className="text-xs text-gray-500">{file.category}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state hint */}
      {files.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Нет загруженных файлов</p>
          <p className="text-gray-500 text-sm mt-1">
            Добавьте первый полезный материал
          </p>
        </div>
      )}
    </div>
  );
}
