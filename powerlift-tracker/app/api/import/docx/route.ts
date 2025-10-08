import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { athletes, plans, exercises, planExercises } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { parseDocxFile } from '@/lib/utils/import-docx';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Проверяем расширение файла
    if (!file.name.endsWith('.docx')) {
      return NextResponse.json(
        { error: 'Only DOCX files are supported' },
        { status: 400 }
      );
    }

    // Читаем файл
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Парсим DOCX
    const importedData = await parseDocxFile(buffer);

    // Проверяем, существует ли атлет с таким именем
    let athlete = await db.query.athletes.findFirst({
      where: and(
        eq(athletes.userId, session.user.id),
        eq(athletes.name, importedData.athleteName)
      ),
    });

    // Если атлета нет, создаём нового
    if (!athlete) {
      const pmHistory = [];
      if (importedData.pmDate && (importedData.squatPM || importedData.benchPM || importedData.deadliftPM)) {
        pmHistory.push({
          date: importedData.pmDate,
          squat: importedData.squatPM || null,
          bench: importedData.benchPM || null,
          deadlift: importedData.deadliftPM || null,
        });
      }

      const newAthlete = await db.insert(athletes).values({
        userId: session.user.id,
        name: importedData.athleteName,
        squatPM: importedData.squatPM,
        benchPM: importedData.benchPM,
        deadliftPM: importedData.deadliftPM,
        pmDate: importedData.pmDate ? new Date(importedData.pmDate) : null,
        pmHistory,
        roundingStep: 2.5,
      }).returning();

      athlete = newAthlete[0];
    } else {
      // Обновляем PM если они есть в импорте
      if (importedData.squatPM || importedData.benchPM || importedData.deadliftPM) {
        const updatedPmHistory = [
          ...(athlete.pmHistory || []),
          {
            date: importedData.pmDate || new Date().toISOString(),
            squat: importedData.squatPM || athlete.squatPM,
            bench: importedData.benchPM || athlete.benchPM,
            deadlift: importedData.deadliftPM || athlete.deadliftPM,
          },
        ];

        await db
          .update(athletes)
          .set({
            squatPM: importedData.squatPM || athlete.squatPM,
            benchPM: importedData.benchPM || athlete.benchPM,
            deadliftPM: importedData.deadliftPM || athlete.deadliftPM,
            pmDate: importedData.pmDate ? new Date(importedData.pmDate) : athlete.pmDate,
            pmHistory: updatedPmHistory,
            updatedAt: new Date(),
          })
          .where(eq(athletes.id, athlete.id));
      }
    }

    // Получаем или создаем упражнения из справочника
    const exerciseMap = new Map<string, string>();
    
    for (const plan of importedData.plans) {
      for (const exercise of plan.exercises) {
        if (!exerciseMap.has(exercise.name)) {
          // Ищем упражнение в БД
          let existingExercise = await db.query.exercises.findFirst({
            where: and(
              eq(exercises.userId, session.user.id),
              eq(exercises.name, exercise.name)
            ),
          });

          // Если упражнения нет, создаем
          if (!existingExercise) {
            const category = exercise.name === 'Присед' ? 'Ноги' : exercise.name === 'Жим' ? 'Грудь' : 'Спина';
            const newExercise = await db.insert(exercises).values({
              userId: session.user.id,
              name: exercise.name,
              category,
            }).returning();
            existingExercise = newExercise[0];
          }

          exerciseMap.set(exercise.name, existingExercise.id);
        }
      }
    }

    // Импортируем планы
    const createdPlans = [];
    for (const plan of importedData.plans) {
      const newPlan = await db.insert(plans).values({
        athleteId: athlete.id,
        week: plan.week,
        workoutNumber: plan.workoutNumber,
        type: plan.type || 'regular',
      }).returning();

      // Создаем упражнения для плана
      for (let i = 0; i < plan.exercises.length; i++) {
        const exercise = plan.exercises[i];
        const exerciseId = exerciseMap.get(exercise.name);
        
        if (exerciseId && exercise.series.length > 0) {
          const firstSeries = exercise.series[0];
          await db.insert(planExercises).values({
            planId: newPlan[0].id,
            exerciseId,
            orderIndex: i,
            targetWeight: firstSeries.weight,
            targetReps: firstSeries.reps,
            targetSets: firstSeries.sets || 1,
          });
        }
      }

      createdPlans.push(newPlan[0]);
    }

    return NextResponse.json({
      success: true,
      athleteId: athlete.id,
      athleteName: athlete.name,
      plansCreated: createdPlans.length,
    });
  } catch (error) {
    console.error('Error importing DOCX:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import DOCX' },
      { status: 500 }
    );
  }
}

