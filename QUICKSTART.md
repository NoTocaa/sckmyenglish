# Quick Start Guide

## 🚀 Быстрый старт

### 1. Установка

```bash
npm install
```

### 2. Запуск разработки

```bash
npm run dev
```

Сайт откроется на http://localhost:5173

### 3. Доступ к админ-панели

Перейдите на http://localhost:5173/admin

## 📁 Основные файлы

| Файл | Описание |
|------|----------|
| `src/app/data/homeworkData.ts` | Домашние задания |
| `src/app/data/usefulData.ts` | Полезные файлы |
| `src/app/pages/Home.tsx` | Главная страница |
| `src/app/pages/admin/` | Админ-панель |

## ✏️ Редактирование ДЗ

### Через админ-панель (рекомендуется)

1. Откройте `/admin`
2. Перейдите в "Домашние задания"
3. Нажмите "Добавить ДЗ"
4. Заполните дату и добавьте задания

### Через код

Откройте `src/app/data/homeworkData.ts` и добавьте:

```typescript
{
  id: 12,
  date: "20.03.2026",
  file: "/files/homework.jpg",
  answers: [
    {
      id: 1,
      question: "Задание 1",
      answer: '<a href="/files/file.pdf">Скачать</a>'
    }
  ]
}
```

## 🔄 Парсинг с nsbonline.ru

### Одноразовый запуск

```bash
npm run parse
```

### Фоновый режим

```bash
npm run parse:watch
```

### Настройка селекторов

1. Откройте `scripts/parser-config.ts`
2. Обновите CSS селекторы под структуру nsbonline.ru
3. Запустите парсер

## 🎨 Изменение стилей

Основные файлы стилей:

- `src/styles/tailwind.css` — Tailwind директивы
- `src/styles/theme.css` — Цветовая схема
- `src/styles/fonts.css` — Шрифты

## 📦 Сборка

```bash
npm run build
```

Файлы сборки будут в папке `dist/`

## 🔧 Полезные команды

```bash
# Установка зависимостей
npm install

# Запуск разработки
npm run dev

# Сборка продакшена
npm run build

# Парсинг ДЗ
npm run parse

# Парсинг в фоне
npm run parse:watch
```

## ❓ Проблемы

### Ошибки сборки

```bash
# Очистите кэш
rm -rf node_modules dist
npm install
npm run dev
```

### Парсер не работает

1. Проверьте доступность nsbonline.ru
2. Обновите селекторы в `parser-config.ts`
3. Запустите с флагом debug

## 📞 Поддержка

- Документация: README.md
- История изменений: CHANGELOG.md
- Конфигурация парсера: scripts/parser-config.ts
