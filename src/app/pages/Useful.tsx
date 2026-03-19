import { FileText, Download } from "lucide-react";
import { usefulFiles } from "../data/usefulData";

export function Useful() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-2">
        {usefulFiles.map((file) => (
          <button
            key={file.id}
            className="w-full flex items-center justify-between px-6 py-4 border border-gray-800 rounded hover:bg-gray-900 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
              <div className="text-left">
                <span className="text-white block">{file.name}</span>
                {file.category && (
                  <span className="text-xs text-gray-500">{file.category}</span>
                )}
              </div>
            </div>
            <Download className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}