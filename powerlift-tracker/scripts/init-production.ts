#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../lib/db/schema';
import bcrypt from 'bcryptjs';

async function initProduction() {
  console.log('🚀 Инициализация production базы данных...');
  
  // Используем NETLIFY_DATABASE_URL для production
  const databaseUrl = process.env.NETLIFY_DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ NETLIFY_DATABASE_URL не найден');
    process.exit(1);
  }
  
  console.log('📊 Подключение к базе данных...');
  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });
  
  try {
    // Проверяем существующих пользователей
    console.log('👥 Проверка существующих пользователей...');
    const existingUsers = await db.select().from(schema.users);
    
    if (existingUsers.length > 0) {
      console.log(`✅ Найдено ${existingUsers.length} пользователей в базе данных`);
      existingUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.name})`);
      });
      return;
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
    
    for (const exercise of exercises) {
      await db.insert(schema.exercises).values(exercise);
      console.log(`   ✅ ${exercise.name}`);
    }
    
    console.log('🎉 Production база данных успешно инициализирована!');
    console.log('📝 Данные для входа:');
    console.log('   Email: trainer@powerlift.com');
    console.log('   Password: password123');
    
  } catch (error) {
    console.error('❌ Ошибка при инициализации:', error);
    process.exit(1);
  }
}

initProduction();
