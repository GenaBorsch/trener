import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { exercises } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const exerciseSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  category: z.string().optional(),
});

// GET - Получение всех упражнений
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get('includeArchived') === 'true';

    const whereConditions = includeArchived
      ? eq(exercises.userId, session.user.id)
      : and(
          eq(exercises.userId, session.user.id),
          eq(exercises.isArchived, false)
        );

    // Хак для in-memory демонстрации: сохраняем userId в глобальной переменной
    (global as any).__currentUserId = session.user.id;
    
    const allExercises = await db.query.exercises.findMany({
      where: whereConditions,
      orderBy: (exercises, { asc }) => [asc(exercises.category), asc(exercises.name)],
    });

    return NextResponse.json(allExercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

// POST - Создание нового упражнения
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    console.log('Session in POST /api/exercises:', {
      user: session?.user,
      userId: session?.user?.id,
    });
    
    if (!session?.user?.id) {
      console.error('No user ID in session!');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = exerciseSchema.parse(body);

    console.log('Creating exercise with userId:', session.user.id);

    const newExercise = await db.insert(exercises).values({
      userId: session.user.id,
      name: validatedData.name,
      description: validatedData.description,
      category: validatedData.category,
    }).returning();

    return NextResponse.json(newExercise[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating exercise:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
    });
    return NextResponse.json(
      { 
        error: 'Failed to create exercise',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

