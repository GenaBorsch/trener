import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { Packer } from 'docx';
import { generateDocxDocument } from '@/lib/utils/export-docx';
import { initializeDemoData } from '@/lib/utils/init-demo-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Инициализируем базу данных (это запустит инициализацию хранилища)
    await db.select().from('users');
    
    // Инициализируем демо-данные (планы и логи)
    initializeDemoData();

    // Устанавливаем глобальные переменные для поиска
    (global as any).__currentUserId = session.user.id;
    (global as any).__currentAthleteIdFromUrl = id;

    // Получаем атлета
    const athlete = await db.query.athletes.findFirst();

    if (!athlete) {
      return NextResponse.json({ error: 'Athlete not found' }, { status: 404 });
    }

    // Получаем все планы атлета
    (global as any).__currentAthleteId = id;
    const athletePlans = await db.query.plans.findMany();

    // Получаем все упражнения пользователя
    const allExercises = await db.query.exercises.findMany();

    // Получаем все упражнения планов
    const storage = (global as any).__inMemoryStorage;
    const allPlanExercises = storage?.planExercises || [];

    // Преобразуем данные в формат для экспорта
    const formattedPlans = athletePlans
      .sort((a, b) => a.week - b.week || a.workoutNumber - b.workoutNumber)
      .map(plan => {
        // Находим упражнения для этого плана
        const planExercisesForPlan = allPlanExercises
          .filter(pe => pe.planId === plan.id)
          .sort((a, b) => a.orderIndex - b.orderIndex);

        return {
          week: plan.week,
          workoutNumber: plan.workoutNumber,
          type: plan.type,
          notes: plan.notes,
          exercises: planExercisesForPlan.map(pe => {
            const exercise = allExercises.find(ex => ex.id === pe.exerciseId);
            return {
              name: exercise?.name || 'Неизвестное упражнение',
              series: [{
                weight: pe.targetWeight || 0,
                reps: pe.targetReps || 0,
                sets: pe.targetSets || 1
              }]
            };
          })
        };
      });

    // Генерируем документ
    const doc = generateDocxDocument({
      athleteName: athlete.name,
      pmDate: athlete.pmDate,
      squatPM: athlete.squatPM,
      benchPM: athlete.benchPM,
      deadliftPM: athlete.deadliftPM,
      plans: formattedPlans,
    });

    // Конвертируем в buffer
    const buffer = await Packer.toBuffer(doc);

    // Формируем имя файла
    const fileName = `${athlete.name.replace(/\s+/g, '_')}_plan.docx`;
    const fileNameAscii = 'athlete_plan.docx'; // Безопасное ASCII имя для старых браузеров

    // Возвращаем файл
    return new NextResponse(buffer as BodyInit, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileNameAscii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error exporting to DOCX:', error);
    return NextResponse.json(
      { error: 'Failed to export to DOCX' },
      { status: 500 }
    );
  }
}

