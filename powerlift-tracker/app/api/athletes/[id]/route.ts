import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { athletes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const athleteUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  squatPM: z.number().positive().optional().nullable(),
  benchPM: z.number().positive().optional().nullable(),
  deadliftPM: z.number().positive().optional().nullable(),
  pmDate: z.string().optional().nullable(),
  roundingStep: z.number().positive().optional(),
});

// GET - Получение атлета по ID
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

    const athlete = await db.query.athletes.findFirst({
      where: and(
        eq(athletes.id, id),
        eq(athletes.userId, session.user.id)
      ),
    });

    if (!athlete) {
      return NextResponse.json({ error: 'Athlete not found' }, { status: 404 });
    }

    return NextResponse.json(athlete);
  } catch (error) {
    console.error('Error fetching athlete:', error);
    return NextResponse.json(
      { error: 'Failed to fetch athlete' },
      { status: 500 }
    );
  }
}

// PUT - Обновление атлета
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = athleteUpdateSchema.parse(body);

    // Получаем текущего атлета для обновления истории PM
    const currentAthlete = await db.query.athletes.findFirst({
      where: and(
        eq(athletes.id, id),
        eq(athletes.userId, session.user.id)
      ),
    });

    if (!currentAthlete) {
      return NextResponse.json({ error: 'Athlete not found' }, { status: 404 });
    }

    // Обновляем историю PM если изменились значения
    let updatedPmHistory = currentAthlete.pmHistory || [];
    const pmChanged = 
      (validatedData.squatPM !== undefined && validatedData.squatPM !== currentAthlete.squatPM) ||
      (validatedData.benchPM !== undefined && validatedData.benchPM !== currentAthlete.benchPM) ||
      (validatedData.deadliftPM !== undefined && validatedData.deadliftPM !== currentAthlete.deadliftPM);

    if (pmChanged) {
      updatedPmHistory = [
        ...updatedPmHistory,
        {
          date: validatedData.pmDate || new Date().toISOString(),
          squat: validatedData.squatPM ?? currentAthlete.squatPM,
          bench: validatedData.benchPM ?? currentAthlete.benchPM,
          deadlift: validatedData.deadliftPM ?? currentAthlete.deadliftPM,
        },
      ];
    }

    const updated = await db
      .update(athletes)
      .set({
        ...validatedData,
        pmDate: validatedData.pmDate ? new Date(validatedData.pmDate) : undefined,
        pmHistory: updatedPmHistory,
        updatedAt: new Date(),
      })
      .where(and(
        eq(athletes.id, id),
        eq(athletes.userId, session.user.id)
      ))
      .returning();

    if (!updated[0]) {
      return NextResponse.json({ error: 'Failed to update athlete' }, { status: 500 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error updating athlete:', error);
    return NextResponse.json(
      { error: 'Failed to update athlete' },
      { status: 500 }
    );
  }
}

// DELETE - Удаление атлета
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db
      .delete(athletes)
      .where(and(
        eq(athletes.id, id),
        eq(athletes.userId, session.user.id)
      ));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting athlete:', error);
    return NextResponse.json(
      { error: 'Failed to delete athlete' },
      { status: 500 }
    );
  }
}




