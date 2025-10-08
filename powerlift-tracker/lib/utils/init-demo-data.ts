// Функция для инициализации демо-данных при каждом запросе
export function initializeDemoData() {
  const storage = (global as any).__inMemoryStorage;
  
  if (!storage) {
    console.log('🚀 Инициализация глобального хранилища с демо-данными');
    return;
  }

  // Если планы уже есть, не перезаписываем
  if (storage.plans && storage.plans.length > 0) {
    return;
  }

  console.log('📋 Инициализация планов тренировок...');

  // Инициализируем массивы если их нет
  if (!storage.plans) storage.plans = [];
  if (!storage.planExercises) storage.planExercises = [];
  if (!storage.workoutLogs) storage.workoutLogs = [];
  if (!storage.exerciseLogs) storage.exerciseLogs = [];

  const athletes = storage.athletes || [];
  const exercises = storage.exercises || [];

  // Создаем планы для каждого атлета
  for (const athlete of athletes) {
    // Создаем 4 недели тренировок
    for (let week = 1; week <= 4; week++) {
      // 3 тренировки в неделю
      for (let workout = 1; workout <= 3; workout++) {
        const planId = `plan-${athlete.id}-w${week}-t${workout}`;
        const isTestWeek = week === 4; // 4-я неделя - проходка
        
        const plan = {
          id: planId,
          athleteId: athlete.id,
          week,
          workoutNumber: workout,
          date: new Date(2024, 9, (week - 1) * 7 + workout * 2), // Октябрь 2024
          type: isTestWeek ? 'test' : 'regular',
          notes: isTestWeek ? 'Проходка - максимальные веса' : undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        storage.plans.push(plan);

        // Добавляем упражнения в план в зависимости от дня тренировки
        let exerciseIds: string[] = [];
        let exerciseParams: Array<{weight: number, reps: number, sets: number}> = [];

        if (workout === 1) { // День 1: Ноги + Грудь
          exerciseIds = [
            exercises.find(e => e.name === 'Приседания со штангой')?.id,
            exercises.find(e => e.name === 'Жим лежа')?.id,
            exercises.find(e => e.name === 'Жим ногами')?.id,
            exercises.find(e => e.name === 'Жим гантелей лежа')?.id,
          ].filter(Boolean);

          if (isTestWeek) {
            // Проходка - работа на максимум
            exerciseParams = [
              { weight: Math.round((athlete.squatPM || 100) * 0.9), reps: 3, sets: 1 },
              { weight: Math.round((athlete.benchPM || 70) * 0.9), reps: 3, sets: 1 },
              { weight: Math.round((athlete.squatPM || 100) * 0.7), reps: 8, sets: 3 },
              { weight: Math.round((athlete.benchPM || 70) * 0.7), reps: 8, sets: 3 },
            ];
          } else {
            // Обычная тренировка
            const intensity = 0.7 + (week - 1) * 0.05; // Прогрессия по неделям
            exerciseParams = [
              { weight: Math.round((athlete.squatPM || 100) * intensity), reps: 5, sets: 4 },
              { weight: Math.round((athlete.benchPM || 70) * intensity), reps: 5, sets: 4 },
              { weight: Math.round((athlete.squatPM || 100) * 0.6), reps: 10, sets: 3 },
              { weight: Math.round((athlete.benchPM || 70) * 0.6), reps: 10, sets: 3 },
            ];
          }
        } else if (workout === 2) { // День 2: Спина + Плечи
          exerciseIds = [
            exercises.find(e => e.name === 'Становая тяга')?.id,
            exercises.find(e => e.name === 'Жим штанги стоя')?.id,
            exercises.find(e => e.name === 'Тяга штанги в наклоне')?.id,
            exercises.find(e => e.name === 'Подтягивания')?.id,
          ].filter(Boolean);

          if (isTestWeek) {
            exerciseParams = [
              { weight: Math.round((athlete.deadliftPM || 120) * 0.9), reps: 3, sets: 1 },
              { weight: Math.round((athlete.benchPM || 70) * 0.6), reps: 5, sets: 3 },
              { weight: Math.round((athlete.deadliftPM || 120) * 0.6), reps: 8, sets: 3 },
              { weight: 0, reps: 8, sets: 3 }, // Подтягивания с весом тела
            ];
          } else {
            const intensity = 0.7 + (week - 1) * 0.05;
            exerciseParams = [
              { weight: Math.round((athlete.deadliftPM || 120) * intensity), reps: 5, sets: 3 },
              { weight: Math.round((athlete.benchPM || 70) * 0.5), reps: 8, sets: 4 },
              { weight: Math.round((athlete.deadliftPM || 120) * 0.6), reps: 8, sets: 3 },
              { weight: 0, reps: 10, sets: 3 },
            ];
          }
        } else { // День 3: Руки + Дополнительные упражнения
          exerciseIds = [
            exercises.find(e => e.name === 'Жим узким хватом')?.id,
            exercises.find(e => e.name === 'Подъем штанги на бицепс')?.id,
            exercises.find(e => e.name === 'Французский жим')?.id,
            exercises.find(e => e.name === 'Молотки с гантелями')?.id,
          ].filter(Boolean);

          const baseWeight = (athlete.benchPM || 70) * 0.6;
          exerciseParams = [
            { weight: Math.round(baseWeight), reps: 8, sets: 4 },
            { weight: Math.round(baseWeight * 0.5), reps: 10, sets: 3 },
            { weight: Math.round(baseWeight * 0.4), reps: 12, sets: 3 },
            { weight: Math.round(baseWeight * 0.3), reps: 12, sets: 3 },
          ];
        }

        // Добавляем упражнения в план
        exerciseIds.forEach((exerciseId, index) => {
          if (exerciseId && exerciseParams[index]) {
            const planExercise = {
              id: `pe-${planId}-${index}`,
              planId,
              exerciseId,
              orderIndex: index,
              targetWeight: exerciseParams[index].weight || undefined,
              targetReps: exerciseParams[index].reps,
              targetSets: exerciseParams[index].sets,
              notes: undefined,
              createdAt: new Date(),
            };
            storage.planExercises.push(planExercise);
          }
        });

        // Создаем логи выполненных тренировок (для первых 3 недель)
        if (week <= 3) {
          const workoutLogId = `wl-${planId}`;
          const workoutLog = {
            id: workoutLogId,
            planId,
            athleteId: athlete.id,
            date: new Date(2024, 9, (week - 1) * 7 + workout * 2 + 1), // На день позже плана
            comment: `Тренировка выполнена. ${isTestWeek ? 'Проходка завершена успешно!' : 'Хорошая работа!'}`,
            createdAt: new Date(),
          };
          storage.workoutLogs.push(workoutLog);

          // Добавляем логи упражнений
          exerciseIds.forEach((exerciseId, index) => {
            if (exerciseId && exerciseParams[index]) {
              const targetParams = exerciseParams[index];
              // Имитируем реальные результаты (немного отличающиеся от плана)
              const actualWeight = targetParams.weight ? 
                targetParams.weight + (Math.random() > 0.5 ? 2.5 : -2.5) : 
                undefined;
              const actualReps = targetParams.reps + (Math.random() > 0.7 ? 1 : 0);
              const actualSets = targetParams.sets;

              const exerciseLog = {
                id: `el-${workoutLogId}-${index}`,
                workoutLogId,
                planExerciseId: `pe-${planId}-${index}`,
                exerciseId,
                actualWeight,
                actualReps,
                actualSets,
                notes: Math.random() > 0.8 ? 'Легко выполнено' : undefined,
                createdAt: new Date(),
              };
              storage.exerciseLogs.push(exerciseLog);
            }
          });
        }
      }
    }
  }

  console.log('✅ Планы тренировок инициализированы:', {
    plans: storage.plans.length,
    planExercises: storage.planExercises.length,
    workoutLogs: storage.workoutLogs.length,
    exerciseLogs: storage.exerciseLogs.length,
  });
}
