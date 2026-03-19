import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  FileText,
  BookOpen,
  Users,
  TrendingUp,
  Plus,
  ArrowRight,
  Settings
} from "lucide-react";
import { dateEntries } from "../../data/homeworkData";
import { usefulFiles } from "../../data/usefulData";

export function AdminDashboard() {
  const stats = [
    {
      name: "Домашних заданий",
      value: dateEntries.length,
      icon: FileText,
      color: "bg-blue-600",
      link: "/admin/homework",
    },
    {
      name: "Полезных файлов",
      value: usefulFiles.length,
      icon: BookOpen,
      color: "bg-purple-600",
      link: "/admin/useful",
    },
    {
      name: "Групп",
      value: "4",
      icon: Users,
      color: "bg-green-600",
      link: "#",
    },
    {
      name: "Записей",
      value: dateEntries.reduce((sum, e) => sum + (e.tasks?.length || 0), 0).toString(),
      icon: TrendingUp,
      color: "bg-orange-600",
      link: "#",
    },
  ];

  const recentHomework = dateEntries.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Дашборд</h1>
          <p className="text-gray-400 mt-1">Обзор учебного процесса</p>
        </div>
        <Link
          to="/admin/homework"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          Добавить ДЗ
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="group rounded-2xl bg-gray-900 border border-gray-800 p-6 hover:border-gray-700 transition-all"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-gray-400 mt-1">{stat.name}</p>
          </Link>
        ))}
      </div>

      {/* Recent Homework */}
      <div className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Последние задания</h2>
          <Link
            to="/admin/homework"
            className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
          >
            Все задания
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-800">
          {recentHomework.map((entry, idx) => (
            <Link
              key={entry.id}
              to="/admin/homework"
              className="block px-6 py-4 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{entry.date}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {(entry.tasks || []).length} заданий
                  </p>
                </div>
                <span className="text-sm text-blue-400">Редактировать</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link
          to="/admin/homework"
          className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all"
        >
          <FileText className="w-8 h-8 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Управление ДЗ</h3>
          <p className="text-gray-400 text-sm">Добавляйте и редактируйте задания</p>
        </Link>
        <Link
          to="/admin/useful"
          className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all"
        >
          <BookOpen className="w-8 h-8 text-purple-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Материалы</h3>
          <p className="text-gray-400 text-sm">Загружайте полезные файлы</p>
        </Link>
        <Link
          to="/admin/settings"
          className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all"
        >
          <Settings className="w-8 h-8 text-orange-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Настройки</h3>
          <p className="text-gray-400 text-sm">Параметры сайта</p>
        </Link>
      </div>
    </div>
  );
}
