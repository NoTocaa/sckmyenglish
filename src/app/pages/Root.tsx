import { Link, Outlet, useLocation } from "react-router";
import { motion } from "framer-motion";
import { Settings, Trophy } from "lucide-react";
import { Footer } from "../components/Footer";

export function Root() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <nav className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3">
              <div>
                <span className="text-xl font-bold text-white">sckmyenglish</span>
                <span className="text-xs text-gray-500 block">ОМГУ им. Достоевского • ФЦТМК</span>
              </div>
            </Link>

            <div className="flex items-center space-x-1">
              <Link
                to="/answers"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive("/answers")
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                Задания
              </Link>
              <Link
                to="/rating"
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isActive("/rating")
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <Trophy className="w-4 h-4" />
                Рейтинг
              </Link>
              <Link
                to="/useful"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive("/useful")
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                Материалы
              </Link>
              <Link
                to="/admin"
                className="ml-4 p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                title="Admin Panel"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
