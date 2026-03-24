# XLSX Rating Table Display with Color Highlighting

## Overview

This document describes the **Rating** feature implementation that displays XLSX tables with color-coded cells based on student performance and debt status.

## Feature Location

**File:** `src/app/pages/Rating.tsx`

## Key Features

### 1. XLSX Parsing with Style Detection

The system reads XLSX files with cell styles preserved:

```typescript
const workbook = XLSX.read(arrayBuffer, {
  type: 'array',
  cellStyles: true,  // Critical: preserves colors
});
```

### 2. Color Detection Logic

The system detects cell background colors from XLSX files:

- **Red cells** (RGB: high R, low G/B) → Debt/missing assignments
- **Green cells** (RGB: high G, low R/B) → Completed assignments
- **Yellow/Orange cells** (RGB: high R+G, low B) → Warnings
- **Blue cells** (RGB: high B) → Extra credit

### 3. Student Row Interface

```typescript
interface StudentRow {
  position: number;
  name: string;
  points: Record<string, number>;
  cellColors: Record<string, string | undefined>; // Stores RGB colors
  totalPoints: number;
  hasDebt: boolean;
  debtType: "light" | "bright" | null;
}
```

### 4. Debt Classification

- **Light Debt** (`bg-red-900/20`): Few missing assignments, auto-closed
- **Bright Debt** (`bg-red-600/30`): Many missing assignments, requires action

### 5. Cell Color Function

```typescript
const getCellColor = (
  value: number,
  debtType?: StudentRow['debtType'],
  cellFill?: string  // RGB color from XLSX
): string
```

**Priority:**
1. XLSX cell color (if available)
2. Value-based fallback coloring

## How to Use

### Adding Rating Files

1. Go to **Admin Panel** → **Домашние задания**
2. Create/edit a homework entry
3. Add a task with type **"Рейтинг"** (`rating_file`)
4. Add the XLSX file URL in the **"Ссылка на файл"** field

### XLSX File Format

The expected XLSX structure:

| # | Student Name | Column 1 | Column 2 | Column 3 | ... |
|---|--------------|----------|----------|----------|-----|
| 1 | Ivanov Ivan  | 1        | 0        | 1        | ... |
| 2 | Petrov Petr  | 1        | 1        | 1        | ... |
|   | **Type**     | Points   | Vis      | Verbs    | ... |

**Last row:** Contains column type hints (Points, Vis, Verbs, etc.)

### Color Coding in XLSX

When creating XLSX files in Excel/LibreOffice:

- **Red fill** (RGB: FF0000 or similar) → Mark as debt
- **Green fill** (RGB: 00FF00 or similar) → Mark as completed
- **Yellow fill** (RGB: FFFF00 or similar) → Warning
- **No fill** → Default styling

## CORS Proxy Fallback

The system automatically tries multiple CORS proxies:

1. `api.allorigins.win`
2. `corsproxy.io`
3. `api.codetabs.com`

If all fail, users can download the file directly.

## Visual Indicators

### Table Header
- 📅 Attendance columns
- 📖 Verbs columns
- ⭐ Points columns
- 📊 Other columns

### Row Styling
- Students with **bright debt** → Red row background (`bg-red-600/10`)
- Students with **light debt** → Light red row background (`bg-red-900/10`)
- Position badges in first column
- Sticky name column for easy scrolling

### Status Badges
- **OK** (Green) → No debts
- **Долг** (Red) → Has debts (shade indicates severity)

## Technical Implementation

### Color Parsing Algorithm

```typescript
// Extract RGB from XLSX color string
const fillColor = cellStyle?.fill?.fgColor?.rgb || cellStyle?.fill?.bgColor?.rgb;

if (fillColor && typeof fillColor === 'string') {
  const rgb = fillColor.toUpperCase().replace(/[^0-9A-F]/g, '');
  if (rgb.length === 8) {
    const r = parseInt(rgb.substring(2, 4), 16);
    const g = parseInt(rgb.substring(4, 6), 16);
    const b = parseInt(rgb.substring(6, 8), 16);
    
    // Red: high R, low G/B
    if (r > 150 && g < 100 && b < 100) {
      return 'bg-red-600/30 text-red-400 font-bold';
    }
    // ... other colors
  }
}
```

### Tailwind Color Classes

- `bg-red-600/30` → 30% opacity red background
- `bg-red-900/20` → 20% opacity dark red background
- `bg-green-600/30` → 30% opacity green background
- `text-red-400` → Red text color
- `font-bold` → Bold text for emphasis

## Dependencies

- `xlsx` (^0.18.5) - XLSX file parsing
- `framer-motion` - Animations
- `lucide-react` - Icons
- `tailwindcss` - Styling

## Testing

To test the feature:

1. Run development server: `npm run dev`
2. Navigate to `/rating`
3. Select a group
4. Click "Показать таблицу" on a rating file
5. Verify:
   - Table loads correctly
   - Colors match XLSX file
   - Debt indicators are accurate
   - Sorting by total points works

## Troubleshooting

### Issue: Colors not showing

**Solution:** Ensure XLSX file has cell fills (not just text colors)

### Issue: CORS errors

**Solution:** 
- Check file URL is accessible
- Verify CORS proxies are working
- Use direct download as fallback

### Issue: Wrong column types

**Solution:** Add type hints in the last row of XLSX:
- "vis" or "посещ" → attendance
- "verb" or "глагол" → verbs
- "point" or "балл" → points

## Future Enhancements

1. **Export to PDF** - Download colored rating table
2. **Email notifications** - Alert students with bright debt
3. **Historical tracking** - Show debt trends over time
4. **Custom color thresholds** - Admin-configurable RGB ranges
5. **Mobile optimization** - Better table scrolling on phones

## Related Files

- `src/app/pages/Rating.tsx` - Main component
- `src/app/types/homework.ts` - Type definitions
- `src/app/data/homeworkData.ts` - Sample data
- `src/app/routes.tsx` - Route configuration

---

**Last Updated:** March 19, 2026
**Author:** AI Assistant (Qwen Code)
**Version:** 2.0 - Enhanced with XLSX color detection
