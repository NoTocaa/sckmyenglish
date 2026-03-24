import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  Settings, 
  Menu, 
  X,
  LogOut,
  Home,
  Shield,
  Users,
  Database
} from "lucide-react";

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navigation = [
    { name: "Дашборд", href: "/admin", icon: LayoutDashboard },
    { name: "Домашние задания", href: "/admin/homework", icon: FileText },
    { name: "Полезные материалы", href: "/admin/useful", icon: BookOpen },
    { name: "Настройки", href: "/admin/settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top Bar - Admin Indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 h-14">
        <div className="h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-600/30">
              <Shield className="w-4 h-4 text-red-500" />
              <span className="text-red-400 font-bold text-sm">ADMIN PANEL</span>
            </div>
            <span className="text-gray-500 text-sm hidden sm:block">
              ОМГУ им. Достоевского • ФЦТМК
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:block">На сайт</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex pt-14">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || window.innerWidth >= 1024) && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed lg:sticky top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto"
            >
              <div className="p-4">
                {/* Admin Info */}
                <div className="mb-6 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Администратор</p>
                      <p className="text-gray-500 text-xs">admin@sckmyenglish.ru</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Database className="w-3 h-3" />
                    <span>Панель управления</span>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive(item.href)
                          ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.name}</span>
                      {isActive(item.href) && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                        />
                      )}
                    </Link>
                  ))}
                </nav>

                {/* Stats */}
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Статистика</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        ДЗ
                      </span>
                      <span className="text-white font-medium">11</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        Групп
                      </span>
                      <span className="text-white font-medium">4</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-2">
                        <BookOpen className="w-3 h-3" />
                        Файлов
                      </span>
                      <span className="text-white font-medium">10</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 bg-gray-950">
          <div className="p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
