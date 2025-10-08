import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { plans, athletes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const seriesSchema = z.object({
  weight: z.number().nonnegative(),
  reps: z.number().positive(),
  sets: z.number().positive().optional(),
});

const exerciseSchema = z.object({
  name: z.enum(['Присед', 'Жим', 'Тяга']),
  series: z.array(seriesSchema),
});

const planUpdateSchema = z.object({
  week: z.number().positive().optional(),
  workoutNumber: z.number().positive().optional(),
  date: z.string().optional().nullable(),
  exercises: z.array(exerciseSchema).optional(),
  type: z.enum(['regular', 'test']).optional(),
  notes: z.string().optional(),
});

// GET - Получение плана по ID
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

    const plan = await db.query.plans.findFirst({
      where: eq(plans.id, id),
      with: {
        athleteId: true,
      },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Проверяем, что атлет принадлежит текущему пользователю
    const athlete = await db.query.athletes.findFirst({
      where: and(
        eq(athletes.id, plan.athleteId),
        eq(athletes.userId, session.user.id)
      ),
    });

    if (!athlete) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}

// PUT - Обновление плана
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
    const validatedData = planUpdateSchema.parse(body);

    // Получаем план и проверяем права доступа
    const existingPlan = await db.query.plans.findFirst({
      where: eq(plans.id, id),
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const athlete = await db.query.athletes.findFirst({
      where: and(
        eq(athletes.id, existingPlan.athleteId),
        eq(athletes.userId, session.user.id)
      ),
    });

    if (!athlete) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updated = await db
      .update(plans)
      .set({
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(plans.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}

// DELETE - Удаление плана
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

    // Получаем план и проверяем права доступа
    const existingPlan = await db.query.plans.findFirst({
      where: eq(plans.id, id),
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const athlete = await db.query.athletes.findFirst({
      where: and(
        eq(athletes.id, existingPlan.athleteId),
        eq(athletes.userId, session.user.id)
      ),
    });

    if (!athlete) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await db.delete(plans).where(eq(plans.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete plan' },
      { status: 500 }
    );
  }
}


