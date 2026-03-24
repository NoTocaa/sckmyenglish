import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Users, ArrowRight, GraduationCap } from "lucide-react";
import { GROUPS } from "../types/homework";

export function GroupSelect() {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const handleSelect = (groupId: string) => {
    setSelectedGroup(groupId);
    // Сохраняем выбор в localStorage
    localStorage.setItem('selectedGroup', groupId);
    
    // Перенаправляем на задания через небольшую задержку
    setTimeout(() => {
      navigate('/answers');
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-4xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-800 text-sm mb-6"
          >
            <GraduationCap className="w-4 h-4 text-blue-500" />
            <span className="text-gray-300">ОМГУ им. Достоевского • ФЦТМК</span>
          </motion.div>
          
          <h1 className="text-5xl font-bold text-white mb-4">
            Выбор группы
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Выберите вашу группу для просмотра домашних заданий и рейтинга
          </p>
        </div>

        {/* Groups Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {GROUPS.map((group, idx) => (
            <motion.button
              key={group.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(group.id)}
              className={`p-8 rounded-2xl border transition-all text-left relative overflow-hidden ${
                selectedGroup === group.id
                  ? 'bg-blue-600 border-blue-500'
                  : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
              }`}
            >
              {/* Decorative circle */}
              <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 opacity-10 rounded-full" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  {selectedGroup === group.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-white"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </motion.div>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">
                  {group.name}
                </h3>
                <p className="text-gray-400 text-sm">
                  ID: {group.id}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-6 rounded-xl bg-gray-900/50 border border-gray-800"
        >
          <h3 className="text-lg font-semibold text-white mb-2">
            ℹ️ Как это работает
          </h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>• Выберите вашу группу из списка</li>
            <li>• Выбор сохранится в браузере</li>
            <li>• Вы будете перенаправлены на страницу с заданиями</li>
            <li>• Сменить группу можно в любой момент в меню</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
