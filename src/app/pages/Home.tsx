import { Link } from "react-router";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Lightbulb, GraduationCap, Calendar, ArrowRight, Trophy, Users } from "lucide-react";

export function Home() {
  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Задания",
      description: "Все ДЗ разделены по типам: на паре, домашка, долги",
      link: "/answers",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Рейтинг",
      description: "Динамическая таблица успеваемости с авто-обновлением",
      link: "/rating",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Материалы",
      description: "Грамматика, слова, шаблоны и многое другое",
      link: "/useful",
      color: "from-purple-500 to-purple-600",
    },
  ];

  const groups = [
    "МБС-07",
    "МПБ-06",
    "МБС-08",
    "МПБ-07",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 blur-3xl"
        />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-800 text-sm"
            >
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <span className="text-gray-300">
                ОМГУ им. Достоевского • ФЦТМК
              </span>
            </motion.div>
            
            <h1 className="text-7xl font-bold text-white tracking-tight">
              sckmyenglish
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Современная платформа для изучения английского языка. 
              Задания, рейтинг и материалы для студентов ФЦТМК.
            </p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex items-center justify-center gap-4"
            >
              <Link
                to="/answers"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all hover:scale-105"
              >
                Задания
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/rating"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-lg font-medium border border-gray-800 hover:bg-gray-800 transition-all hover:scale-105"
              >
                <Trophy className="w-5 h-5" />
                Рейтинг
              </Link>
            </motion.div>
          </motion.div>

          {/* Groups */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex items-center justify-center gap-2 flex-wrap"
          >
            <span className="text-gray-500 text-sm">Группы:</span>
            {groups.map((group) => (
              <span
                key={group}
                className="px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-gray-400 text-sm"
              >
                {group}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Link
                to={feature.link}
                className="group block p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-all"
              >
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 shadow-lg`}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Info Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-gray-800 p-12 text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Lightbulb className="w-12 h-12 text-yellow-500 mx-auto mb-6" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Учите английский эффективно
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Платформа создана для студентов ФЦТМК ОМГУ. Все материалы актуальны 
            и автоматически обновляются с nsbonline.ru.
          </p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 text-sm text-gray-500"
          >
            <motion.span
              whileHover={{ scale: 1.05, y: -2 }}
              className="px-4 py-2 rounded-full bg-gray-900 border border-gray-800"
            >
              ✓ Авто-парсинг с nsbonline
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.05, y: -2 }}
              className="px-4 py-2 rounded-full bg-gray-900 border border-gray-800"
            >
              ✓ Динамический рейтинг
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.05, y: -2 }}
              className="px-4 py-2 rounded-full bg-gray-900 border border-gray-800"
            >
              ✓ Удобная группировка
            </motion.span>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
