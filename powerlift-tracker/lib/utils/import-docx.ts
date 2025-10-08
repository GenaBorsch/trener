import mammoth from 'mammoth';
import { parseSeries, SeriesSet } from './calculations';

export interface ImportedPlan {
  week: number;
  workoutNumber: number;
  exercises: Array<{
    name: 'Присед' | 'Жим' | 'Тяга';
    series: SeriesSet[];
  }>;
  type?: 'regular' | 'test';
}

export interface ImportedData {
  athleteName: string;
  pmDate?: string;
  squatPM?: number;
  benchPM?: number;
  deadliftPM?: number;
  plans: ImportedPlan[];
}

/**
 * Парсинг DOCX файла в формате как у Марианы
 */
export async function parseDocxFile(buffer: Buffer): Promise<ImportedData> {
  // Конвертируем DOCX в текст
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value;

  const data: ImportedData = {
    athleteName: '',
    plans: [],
  };

  // Разбиваем на строки
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  let currentWeek: number | null = null;
  let currentWorkoutNumber: number | null = null;
  let currentExercises: ImportedPlan['exercises'] = [];
  let isTest = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Извлекаем имя атлета
    const nameMatch = line.match(/^Имя:\s*(.+)$/i);
    if (nameMatch) {
      data.athleteName = nameMatch[1].trim().toUpperCase();
      continue;
    }

    // Извлекаем дату PM
    const pmDateMatch = line.match(/^ПМ\s*\((.+)\):?$/i);
    if (pmDateMatch) {
      const dateStr = pmDateMatch[1].trim();
      data.pmDate = parseDateString(dateStr);
      continue;
    }

    // Извлекаем PM значения
    const squatMatch = line.match(/^Присед:\s*(\d+(?:\.\d+)?)\s*кг$/i);
    if (squatMatch) {
      data.squatPM = parseFloat(squatMatch[1]);
      continue;
    }

    const benchMatch = line.match(/^Жим:\s*(\d+(?:\.\d+)?)\s*кг$/i);
    if (benchMatch) {
      data.benchPM = parseFloat(benchMatch[1]);
      continue;
    }

    const deadliftMatch = line.match(/^Тяга:\s*(\d+(?:\.\d+)?)\s*кг$/i);
    if (deadliftMatch) {
      data.deadliftPM = parseFloat(deadliftMatch[1]);
      continue;
    }

    // Извлекаем номер недели
    const weekMatch = line.match(/^Неделя\s+(\d+)$/i);
    if (weekMatch) {
      // Сохраняем предыдущий план если есть
      if (currentWeek !== null && currentWorkoutNumber !== null && currentExercises.length > 0) {
        data.plans.push({
          week: currentWeek,
          workoutNumber: currentWorkoutNumber,
          exercises: currentExercises,
          type: isTest ? 'test' : 'regular',
        });
        currentExercises = [];
        isTest = false;
      }
      
      currentWeek = parseInt(weekMatch[1], 10);
      continue;
    }

    // Извлекаем номер тренировки
    const workoutMatch = line.match(/^Тренировка\s+(\d+)(?:\s*-\s*ПРОХОДКА)?$/i);
    if (workoutMatch) {
      // Сохраняем предыдущий план если есть
      if (currentWeek !== null && currentWorkoutNumber !== null && currentExercises.length > 0) {
        data.plans.push({
          week: currentWeek,
          workoutNumber: currentWorkoutNumber,
          exercises: currentExercises,
          type: isTest ? 'test' : 'regular',
        });
        currentExercises = [];
      }

      currentWorkoutNumber = parseInt(workoutMatch[1], 10);
      isTest = line.includes('ПРОХОДКА');
      continue;
    }

    // Извлекаем упражнения
    const exerciseMatch = line.match(/^(Присед|Жим|Тяга):\s*(.+)$/i);
    if (exerciseMatch && currentWeek !== null && currentWorkoutNumber !== null) {
      const exerciseName = exerciseMatch[1] as 'Присед' | 'Жим' | 'Тяга';
      const seriesText = exerciseMatch[2].trim();
      
      try {
        const series = parseSeries(seriesText);
        if (series.length > 0) {
          currentExercises.push({
            name: exerciseName,
            series,
          });
        }
      } catch (error) {
        console.warn(`Failed to parse series for ${exerciseName}: ${seriesText}`);
      }
      continue;
    }
  }

  // Сохраняем последний план
  if (currentWeek !== null && currentWorkoutNumber !== null && currentExercises.length > 0) {
    data.plans.push({
      week: currentWeek,
      workoutNumber: currentWorkoutNumber,
      exercises: currentExercises,
      type: isTest ? 'test' : 'regular',
    });
  }

  if (!data.athleteName) {
    throw new Error('Имя атлета не найдено в файле');
  }

  return data;
}

/**
 * Парсинг даты из строки (формат: dd.mm.yyyy)
 */
function parseDateString(dateStr: string): string {
  const match = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return new Date().toISOString().split('T')[0];
}





