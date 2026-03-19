import { Save, Globe, Bell, Database } from "lucide-react";

export function AdminSettings() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Настройки</h1>
        <p className="text-gray-400 mt-1">Управление параметрами сайта</p>
      </div>

      {/* General Settings */}
      <div className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-3">
          <Globe className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-white">Общие настройки</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Название сайта
            </label>
            <input
              type="text"
              defaultValue="sckmyenglish"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Описание
            </label>
            <textarea
              defaultValue="Современная платформа для изучения английского языка"
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Parser Settings */}
      <div className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-3">
          <Database className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold text-white">Парсинг с nsbonline.ru</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Автоматический парсинг</p>
              <p className="text-gray-400 text-sm mt-1">
                Автоматически обновлять ДЗ с оригинального сайта
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL источника
            </label>
            <input
              type="text"
              defaultValue="https://nsbonline.ru"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Интервал обновления
            </label>
            <select className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600">
              <option>Каждый час</option>
              <option>Раз в 6 часов</option>
              <option>Раз в день</option>
              <option>Вручную</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-3">
          <Bell className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-semibold text-white">Уведомления</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Email уведомления</p>
              <p className="text-gray-400 text-sm mt-1">
                Получать уведомления о новых ДЗ
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
          <Save className="w-5 h-5" />
          Сохранить изменения
        </button>
      </div>
    </div>
  );
}
