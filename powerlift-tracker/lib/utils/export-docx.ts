import { Document, Paragraph, TextRun, AlignmentType } from 'docx';
import { formatSeries, SeriesSet } from './calculations';

interface Exercise {
  name: string;
  series: SeriesSet[];
}

interface Plan {
  week: number;
  workoutNumber: number;
  exercises: Exercise[];
  type?: 'regular' | 'test';
  notes?: string | null;
}

interface ExportData {
  athleteName: string;
  pmDate?: Date | null;
  squatPM?: number | null;
  benchPM?: number | null;
  deadliftPM?: number | null;
  plans: Plan[];
}

/**
 * Генерация DOCX документа в формате как у Марианы
 */
export function generateDocxDocument(data: ExportData): Document {
  const paragraphs: Paragraph[] = [];

  // Заголовок - Имя атлета
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Имя: ${data.athleteName.toUpperCase()}`,
          bold: true,
          size: 28,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // PM блок
  const pmDateStr = data.pmDate 
    ? new Date(data.pmDate).toLocaleDateString('ru-RU') 
    : new Date().toLocaleDateString('ru-RU');

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `ПМ (${pmDateStr}):`,
          bold: true,
        }),
      ],
      spacing: { after: 100 },
    })
  );

  if (data.squatPM) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Присед: ${data.squatPM} кг`,
          }),
        ],
      })
    );
  }

  if (data.benchPM) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Жим: ${data.benchPM} кг`,
          }),
        ],
      })
    );
  }

  if (data.deadliftPM) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Тяга: ${data.deadliftPM} кг`,
          }),
        ],
      })
    );
  }

  paragraphs.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  // Группируем планы по неделям
  const plansByWeek = data.plans.reduce((acc, plan) => {
    if (!acc[plan.week]) {
      acc[plan.week] = [];
    }
    acc[plan.week].push(plan);
    return acc;
  }, {} as Record<number, Plan[]>);

  // Сортируем недели
  const sortedWeeks = Object.keys(plansByWeek)
    .map(Number)
    .sort((a, b) => a - b);

  // Генерируем контент по неделям
  for (const week of sortedWeeks) {
    const weekPlans = plansByWeek[week].sort(
      (a, b) => a.workoutNumber - b.workoutNumber
    );

    // Заголовок недели
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Неделя ${week}`,
            bold: true,
            size: 24,
          }),
        ],
        spacing: { before: 300, after: 200 },
      })
    );

    // Тренировки недели
    for (const plan of weekPlans) {
      // Заголовок тренировки
      const trainingTitle = plan.type === 'test' 
        ? `Тренировка ${plan.workoutNumber} - ПРОХОДКА`
        : `Тренировка ${plan.workoutNumber}`;

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trainingTitle,
              bold: true,
            }),
          ],
          spacing: { before: 200, after: 100 },
        })
      );

      // Упражнения
      for (const exercise of plan.exercises) {
        const seriesText = exercise.series
          .map((s) => {
            if (s.sets && s.sets > 1) {
              return `${s.weight}кг×${s.reps}×${s.sets}`;
            }
            return `${s.weight}кг×${s.reps}`;
          })
          .join(', ');

        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${exercise.name}: `,
                bold: false,
              }),
              new TextRun({
                text: seriesText,
              }),
            ],
          })
        );
      }

      // Заметки
      if (plan.notes) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Примечание: ${plan.notes}`,
                italics: true,
                size: 20,
              }),
            ],
            spacing: { before: 50 },
          })
        );
      }

      paragraphs.push(new Paragraph({ text: '' }));
    }
  }

  return new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });
}


