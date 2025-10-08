import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { athletes, plans, planExercises, exercises } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { Packer } from 'docx';
import { generateDocxDocument } from '@/lib/utils/export-docx';

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

    // Получаем атлета
    const athlete = await db.query.athletes.findFirst({
      where: and(
        eq(athletes.id, id),
        eq(athletes.userId, session.user.id)
      ),
    });

    if (!athlete) {
      return NextResponse.json({ error: 'Athlete not found' }, { status: 404 });
    }

    // Получаем все планы атлета с упражнениями
    const athletePlans = await db.query.plans.findMany({
      where: eq(plans.athleteId, id),
      orderBy: (plans, { asc }) => [asc(plans.week), asc(plans.workoutNumber)],
      with: {
        planExercises: {
          with: {
            exercise: true
          },
          orderBy: (planExercises, { asc }) => [asc(planExercises.orderIndex)],
        }
      }
    });

    // Преобразуем данные в формат для экспорта
    const formattedPlans = athletePlans.map(plan => ({
      week: plan.week,
      workoutNumber: plan.workoutNumber,
      type: plan.type,
      notes: plan.notes,
      exercises: plan.planExercises.map(pe => ({
        name: pe.exercise.name,
        series: [{
          weight: pe.targetWeight || 0,
          reps: pe.targetReps || 0,
          sets: pe.targetSets || 1
        }]
      }))
    }));

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

