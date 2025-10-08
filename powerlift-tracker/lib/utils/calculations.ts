/**
 * Утилиты для расчетов весов и парсинга серий
 */

// Округление веса до указанного шага (0.5, 1, 2.5 кг)
export function roundWeight(weight: number, step: number = 2.5): number {
  return Math.round(weight / step) * step;
}

// Расчет веса от процента PM
export function calculateWeight(pm: number, percent: number, roundingStep: number = 2.5): number {
  const weight = pm * percent;
  return roundWeight(weight, roundingStep);
}

// Стандартные проценты из примера Excel
export const STANDARD_PERCENTS = [
  0.3, 0.36, 0.42, 0.48, 0.54, 0.6, 0.66, 0.72, 0.78, 0.84,
  0.9, 0.96, 1.0, 1.05
];

// Генерация таблицы весов для атлета
export function generateWeightTable(
  pm: number,
  percents: number[] = STANDARD_PERCENTS,
  roundingStep: number = 2.5
): Array<{ percent: number; weight: number }> {
  return percents.map(percent => ({
    percent,
    weight: calculateWeight(pm, percent, roundingStep),
  }));
}

// Типы для парсинга серий
export interface SeriesSet {
  weight: number;
  reps: number;
  sets?: number;
}

/**
 * Парсинг текста серий в структурированный формат
 * Поддерживаемые форматы:
 * - "50кг×6" или "50×6" (вес × повторы)
 * - "50кг×6×6" или "50×6×6" (вес × повторы × подходы)
 * - "6,,6,,,,5,4,6*6" (Excel формат: повторы через запятые, * = умножение подходов)
 * - Смешанный: "25кг×6, 32.5кг×6, 50кг×6×6"
 */
export function parseSeries(text: string): SeriesSet[] {
  const series: SeriesSet[] = [];
  
  // Убираем лишние пробелы
  text = text.trim();
  
  // Проверяем формат Excel (содержит запятые и не содержит "кг" или "×")
  if (text.includes(',') && !text.includes('кг') && !text.includes('×')) {
    return parseExcelSeries(text);
  }
  
  // Разбиваем по запятым для обработки нескольких упражнений
  const parts = text.split(',').map(p => p.trim()).filter(p => p);
  
  for (const part of parts) {
    // Формат: "50кг×6×6" или "50×6×6"
    const match = part.match(/(\d+(?:\.\d+)?)\s*(?:кг|kg)?\s*[×x*]\s*(\d+)(?:\s*[×x*]\s*(\d+))?/i);
    
    if (match) {
      const weight = parseFloat(match[1]);
      const reps = parseInt(match[2], 10);
      const sets = match[3] ? parseInt(match[3], 10) : undefined;
      
      series.push({ weight, reps, sets });
    }
  }
  
  return series;
}

/**
 * Парсинг Excel формата: "6,,6,,,,5,4,6*6"
 * Пустые значения (запятые) игнорируются
 * Формат N*M означает M повторений по N повторов
 */
function parseExcelSeries(text: string): SeriesSet[] {
  const series: SeriesSet[] = [];
  const parts = text.split(',').map(p => p.trim());
  
  for (const part of parts) {
    if (!part) continue;
    
    // Проверяем формат N*M (например, 6*6)
    if (part.includes('*')) {
      const [reps, sets] = part.split('*').map(n => parseInt(n.trim(), 10));
      if (!isNaN(reps) && !isNaN(sets)) {
        // В Excel формате нет весов, только повторы
        series.push({ weight: 0, reps, sets });
      }
    } else {
      const reps = parseInt(part, 10);
      if (!isNaN(reps)) {
        series.push({ weight: 0, reps });
      }
    }
  }
  
  return series;
}

/**
 * Форматирование серий в текст для отображения
 * Формат: "50кг×6, 55кг×5×3"
 */
export function formatSeries(series: SeriesSet[]): string {
  return series.map(s => {
    if (s.sets && s.sets > 1) {
      return `${s.weight}кг×${s.reps}×${s.sets}`;
    }
    return `${s.weight}кг×${s.reps}`;
  }).join(', ');
}

/**
 * Валидация серий
 */
export function validateSeries(series: SeriesSet[]): boolean {
  return series.every(s => 
    s.weight >= 0 && 
    s.reps > 0 && 
    (!s.sets || s.sets > 0)
  );
}



