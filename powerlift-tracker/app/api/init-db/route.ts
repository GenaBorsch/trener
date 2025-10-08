import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../../../lib/db/schema';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    console.log('🚀 Инициализация production базы данных...');
    
    // Используем NETLIFY_DATABASE_URL для production
    const databaseUrl = process.env.NETLIFY_DATABASE_URL;
    
    if (!databaseUrl) {
      return NextResponse.json({ 
        error: 'NETLIFY_DATABASE_URL не найден' 
      }, { status: 500 });
    }
    
    console.log('📊 Подключение к базе данных...');
    const sql = neon(databaseUrl);
    const db = drizzle(sql, { schema });
    
    // Проверяем существующих пользователей
    console.log('👥 Проверка существующих пользователей...');
    const existingUsers = await db.select().from(schema.users);
    
    if (existingUsers.length > 0) {
      console.log(`✅ Найдено ${existingUsers.length} пользователей в базе данных`);
      return NextResponse.json({ 
        message: `База данных уже инициализирована. Найдено ${existingUsers.length} пользователей.`,
        users: existingUsers.map(u => ({ email: u.email, name: u.name }))
      });
    }
    
    // Создаем тестового пользователя
    console.log('👤 Создание тестового пользователя...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const [newUser] = await db.insert(schema.users).values({
      email: 'trainer@powerlift.com',
      name: 'Тренер',
      password: hashedPassword,
    }).returning();
    
    console.log(`✅ Пользователь создан: ${newUser.email}`);
    
    // Создаем базовые упражнения
    console.log('🏋️ Создание базовых упражнений...');
    const exercises = [
      { name: 'Приседания', category: 'squat' },
      { name: 'Жим лежа', category: 'bench' },
      { name: 'Становая тяга', category: 'deadlift' },
      { name: 'Жим стоя', category: 'press' },
      { name: 'Подтягивания', category: 'pull' },
      { name: 'Отжимания на брусьях', category: 'dip' },
    ];
    
    const createdExercises = [];
    for (const exercise of exercises) {
      const [created] = await db.insert(schema.exercises).values(exercise).returning();
      createdExercises.push(created);
      console.log(`   ✅ ${exercise.name}`);
    }
    
    console.log('🎉 Production база данных успешно инициализирована!');
    
    return NextResponse.json({
      message: 'База данных успешно инициализирована!',
      user: { email: newUser.email, name: newUser.name },
      exercises: createdExercises.length,
      credentials: {
        email: 'trainer@powerlift.com',
        password: 'password123'
      }
    });
    
  } catch (error) {
    console.error('❌ Ошибка при инициализации:', error);
    return NextResponse.json({ 
      error: 'Ошибка при инициализации базы данных',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
