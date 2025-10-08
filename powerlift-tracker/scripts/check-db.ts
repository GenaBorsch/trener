import { db } from '../lib/db';
import { users, exercises, athletes, plans, planExercises, workoutLogs, exerciseLogs } from '../lib/db/schema';

async function checkDatabase() {
  console.log('=== Проверка базы данных ===\n');

  try {
    // Проверяем пользователей
    const allUsers = await db.select().from(users);
    console.log('Пользователи в БД:', allUsers.length);
    allUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.name}`);
    });

    console.log('\n');

    // Проверяем атлетов
    const allAthletes = await db.select().from(athletes);
    console.log('Атлеты в БД:', allAthletes.length);
    allAthletes.forEach(athlete => {
      console.log(`- ID: ${athlete.id}, Name: ${athlete.name}, UserID: ${athlete.userId}`);
    });

    console.log('\n');

    // Проверяем упражнения
    const allExercises = await db.select().from(exercises);
    console.log('Упражнения в БД:', allExercises.length);
    allExercises.forEach(ex => {
      console.log(`- ID: ${ex.id}, Name: ${ex.name}, Category: ${ex.category}`);
    });

    console.log('\n');

    // Проверяем планы
    const allPlans = await db.select().from(plans);
    console.log('Планы тренировок в БД:', allPlans.length);
    allPlans.forEach(plan => {
      console.log(`- ID: ${plan.id}, Week: ${plan.week}, Workout: ${plan.workoutNumber}, Type: ${plan.type}`);
    });

    console.log('\n');

    // Проверяем упражнения в планах
    const allPlanExercises = await db.select().from(planExercises);
    console.log('Упражнения в планах:', allPlanExercises.length);

    console.log('\n');

    // Проверяем логи тренировок
    const allWorkoutLogs = await db.select().from(workoutLogs);
    console.log('Логи тренировок:', allWorkoutLogs.length);

    console.log('\n');

    // Проверяем логи упражнений
    const allExerciseLogs = await db.select().from(exerciseLogs);
    console.log('Логи упражнений:', allExerciseLogs.length);

  } catch (error) {
    console.error('Ошибка при проверке базы данных:', error);
  }
}

checkDatabase().catch(console.error);





