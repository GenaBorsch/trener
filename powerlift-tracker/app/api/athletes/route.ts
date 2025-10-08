import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { athletes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Схема валидации для создания/обновления атлета
const athleteSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  squatPM: z.number().positive().optional().nullable(),
  benchPM: z.number().positive().optional().nullable(),
  deadliftPM: z.number().positive().optional().nullable(),
  pmDate: z.string().optional().nullable(),
  roundingStep: z.number().positive().default(2.5),
});

// GET - Получение всех атлетов
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Хак для in-memory демонстрации: сохраняем userId в глобальной переменной
    (global as any).__currentUserId = session.user.id;
    
    const allAthletes = await db.query.athletes.findMany({
      where: eq(athletes.userId, session.user.id),
      orderBy: (athletes, { desc }) => [desc(athletes.createdAt)],
    });

    return NextResponse.json(allAthletes);
  } catch (error) {
    console.error('Error fetching athletes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch athletes' },
      { status: 500 }
    );
  }
}

// POST - Создание нового атлета
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    console.log('Session in POST /api/athletes:', JSON.stringify({
      user: session?.user,
      userId: session?.user?.id,
      hasSession: !!session,
    }, null, 2));
    
    if (!session?.user?.id) {
      console.error('No user ID in session!');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = athleteSchema.parse(body);

    // Создаем начальную запись в истории PM
    const pmHistory = [];
    if (validatedData.squatPM || validatedData.benchPM || validatedData.deadliftPM) {
      pmHistory.push({
        date: validatedData.pmDate || new Date().toISOString(),
        squat: validatedData.squatPM || null,
        bench: validatedData.benchPM || null,
        deadlift: validatedData.deadliftPM || null,
      });
    }

    const newAthlete = await db.insert(athletes).values({
      userId: session.user.id,
      name: validatedData.name,
      squatPM: validatedData.squatPM,
      benchPM: validatedData.benchPM,
      deadliftPM: validatedData.deadliftPM,
      pmDate: validatedData.pmDate ? new Date(validatedData.pmDate) : null,
      pmHistory: pmHistory,
      roundingStep: validatedData.roundingStep,
    }).returning();

    return NextResponse.json(newAthlete[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating athlete:', error);
    return NextResponse.json(
      { error: 'Failed to create athlete' },
      { status: 500 }
    );
  }
}

