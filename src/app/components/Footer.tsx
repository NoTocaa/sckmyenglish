import { BookOpen, GraduationCap, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              sckmyenglish
            </h3>
            <p className="text-gray-400 text-sm mb-2">
              Платформа для изучения английского языка
            </p>
            <p className="text-gray-500 text-xs">
              ОМГУ им. Достоевского • ФЦТМК
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">
              Разделы
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-400 hover:text-white transition-colors">
                  Главная
                </a>
              </li>
              <li>
                <a href="/answers" className="text-gray-400 hover:text-white transition-colors">
                  Задания
                </a>
              </li>
              <li>
                <a href="/rating" className="text-gray-400 hover:text-white transition-colors">
                  Рейтинг
                </a>
              </li>
              <li>
                <a href="/useful" className="text-gray-400 hover:text-white transition-colors">
                  Материалы
                </a>
              </li>
            </ul>
          </div>

          {/* Groups */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">
              Группы
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>МБС-07</li>
              <li>МПБ-06</li>
              <li>МБС-08</li>
              <li>МПБ-07</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} sckmyenglish. Создано студентами для студентов.</p>
        </div>
      </div>
    </footer>
  );
}
