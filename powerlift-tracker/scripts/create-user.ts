import bcrypt from 'bcryptjs';
import { db } from '../lib/db';
import { users } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function createUser() {
  const email = process.argv[2] || 'admin@example.com';
  const password = process.argv[3] || 'password123';
  const name = process.argv[4] || 'Тренер';

  // Проверяем, существует ли пользователь
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    console.log(`Пользователь с email ${email} уже существует`);
    process.exit(1);
  }

  // Хешируем пароль
  const passwordHash = await bcrypt.hash(password, 10);

  // Создаем пользователя
  const newUser = await db.insert(users).values({
    email,
    passwordHash,
    name,
  }).returning();

  console.log('✓ Пользователь успешно создан:');
  console.log(`  Email: ${newUser[0].email}`);
  console.log(`  Имя: ${newUser[0].name}`);
  console.log(`  Пароль: ${password}`);
}

createUser().catch((error) => {
  console.error('Ошибка при создании пользователя:', error);
  process.exit(1);
});



