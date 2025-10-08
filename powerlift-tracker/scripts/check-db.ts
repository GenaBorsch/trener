import { db } from '../lib/db';
import { users, exercises } from '../lib/db/schema';

async function checkDatabase() {
  console.log('=== Проверка базы данных ===\n');

  // Проверяем пользователей
  const allUsers = await db.query.users.findMany();
  console.log('Пользователи в БД:', allUsers.length);
  allUsers.forEach(user => {
    console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.name}`);
  });

  console.log('\n');

  // Проверяем упражнения
  const allExercises = await db.query.exercises.findMany();
  console.log('Упражнения в БД:', allExercises.length);
  allExercises.forEach(ex => {
    console.log(`- ID: ${ex.id}, Name: ${ex.name}, UserID: ${ex.userId}`);
  });
}

checkDatabase().catch(console.error);




