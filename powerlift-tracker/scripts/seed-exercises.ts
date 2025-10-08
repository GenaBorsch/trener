import { db } from '../lib/db';
import { users, exercises } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function seedExercises() {
  const email = process.argv[2] || 'trainer@powerlift.com';

  // Находим пользователя
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    console.error(`Пользователь с email ${email} не найден`);
    process.exit(1);
  }

  // Стандартные упражнения для пауэрлифтинга
  const standardExercises = [
    { name: 'Присед со штангой', category: 'Ноги', description: 'Классический присед' },
    { name: 'Жим лежа', category: 'Грудь', description: 'Жим штанги лежа на горизонтальной скамье' },
    { name: 'Становая тяга', category: 'Спина', description: 'Классическая становая тяга' },
    { name: 'Жим стоя', category: 'Плечи', description: 'Армейский жим стоя' },
    { name: 'Подтягивания', category: 'Спина', description: 'Подтягивания на турнике' },
    { name: 'Жим узким хватом', category: 'Руки', description: 'Жим лежа узким хватом для трицепса' },
    { name: 'Тяга штанги в наклоне', category: 'Спина', description: 'Тяга штанги к поясу в наклоне' },
    { name: 'Разгибания ног', category: 'Ноги', description: 'Разгибания ног в тренажере' },
  ];

  console.log('Добавление стандартных упражнений...');

  for (const exercise of standardExercises) {
    await db.insert(exercises).values({
      userId: user.id,
      ...exercise,
    });
    console.log(`✓ ${exercise.name}`);
  }

  console.log(`\n✓ Добавлено ${standardExercises.length} упражнений для пользователя ${user.email}`);
}

seedExercises().catch((error) => {
  console.error('Ошибка при добавлении упражнений:', error);
  process.exit(1);
});





