import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { athletes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// GET - Получение истории PM атлета
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

    return NextResponse.json(athlete.pmHistory || []);
  } catch (error) {
    console.error('Error fetching PM history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PM history' },
      { status: 500 }
    );
  }
}



