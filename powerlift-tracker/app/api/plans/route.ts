import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { plans, athletes, planExercises, exercises } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Схема валидации для упражнений в плане
const planExerciseSchema = z.object({
  exerciseId: z.string(),
  orderIndex: z.number().nonnegative().default(0),
  targetWeight: z.number().positive().optional().nullable(),
  targetReps: z.number().positive().optional().nullable(),
  targetSets: z.number().positive().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const planSchema = z.object({
  athleteId: z.string(),
  week: z.number().positive(),
  workoutNumber: z.number().positive(),
  date: z.string().optional().nullable(),
  exercises: z.array(planExerciseSchema),
  type: z.enum(['regular', 'test']).default('regular'),
  notes: z.string().optional(),
});

// GET - Получение планов (с фильтрацией по атлету)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get('athleteId');

    if (!athleteId) {
      return NextResponse.json(
        { error: 'athleteId parameter is required' },
        { status: 400 }
      );
    }

    // Проверяем, что атлет принадлежит текущему пользователю
    const athlete = await db.query.athletes.findFirst({
      where: and(
        eq(athletes.id, athleteId),
        eq(athletes.userId, session.user.id)
      ),
    });

    if (!athlete) {
      return NextResponse.json({ error: 'Athlete not found' }, { status: 404 });
    }

    // Получаем планы с упражнениями
    const allPlans = await db.query.plans.findMany({
      where: eq(plans.athleteId, athleteId),
      orderBy: (plans, { asc }) => [asc(plans.week), asc(plans.workoutNumber)],
    });

    // Для каждого плана получаем упражнения
    const plansWithExercises = await Promise.all(
      allPlans.map(async (plan) => {
        const planExercisesList = await db.query.planExercises.findMany({
          where: eq(planExercises.planId, plan.id),
          orderBy: (planExercises, { asc }) => [asc(planExercises.orderIndex)],
        });

        // Получаем данные упражнений
        const exercisesData = await Promise.all(
          planExercisesList.map(async (pe) => {
            const exercise = await db.query.exercises.findFirst({
              where: eq(exercises.id, pe.exerciseId),
            });
            return {
              id: pe.id,
              exerciseId: pe.exerciseId,
              exerciseName: exercise?.name || 'Unknown',
              orderIndex: pe.orderIndex,
              targetWeight: pe.targetWeight,
              targetReps: pe.targetReps,
              targetSets: pe.targetSets,
              notes: pe.notes,
            };
          })
        );

        return {
          ...plan,
          exercises: exercisesData,
        };
      })
    );

    return NextResponse.json(plansWithExercises);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

// POST - Создание нового плана
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = planSchema.parse(body);

    // Проверяем, что атлет принадлежит текущему пользователю
    const athlete = await db.query.athletes.findFirst({
      where: and(
        eq(athletes.id, validatedData.athleteId),
        eq(athletes.userId, session.user.id)
      ),
    });

    if (!athlete) {
      return NextResponse.json({ error: 'Athlete not found' }, { status: 404 });
    }

    // Создаем план
    const newPlan = await db.insert(plans).values({
      athleteId: validatedData.athleteId,
      week: validatedData.week,
      workoutNumber: validatedData.workoutNumber,
      date: validatedData.date ? new Date(validatedData.date) : null,
      type: validatedData.type,
      notes: validatedData.notes,
    }).returning();

    // Добавляем упражнения к плану
    if (validatedData.exercises.length > 0) {
      await db.insert(planExercises).values(
        validatedData.exercises.map((exercise, index) => ({
          planId: newPlan[0].id,
          exerciseId: exercise.exerciseId,
          orderIndex: exercise.orderIndex ?? index,
          targetWeight: exercise.targetWeight,
          targetReps: exercise.targetReps,
          targetSets: exercise.targetSets,
          notes: exercise.notes,
        }))
      );
    }

    // Получаем созданный план с упражнениями
    const planExercisesList = await db.query.planExercises.findMany({
      where: eq(planExercises.planId, newPlan[0].id),
    });

    const exercisesData = await Promise.all(
      planExercisesList.map(async (pe) => {
        const exercise = await db.query.exercises.findFirst({
          where: eq(exercises.id, pe.exerciseId),
        });
        return {
          id: pe.id,
          exerciseId: pe.exerciseId,
          exerciseName: exercise?.name || 'Unknown',
          targetWeight: pe.targetWeight,
          targetReps: pe.targetReps,
          targetSets: pe.targetSets,
          notes: pe.notes,
        };
      })
    );

    return NextResponse.json(
      { ...newPlan[0], exercises: exercisesData },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}

