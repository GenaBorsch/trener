import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { athletes, plans, planExercises, exercises } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import Link from 'next/link';
import { generateWeightTable } from '@/lib/utils/calculations';
import PMProgressChart from '@/components/PMProgressChart';

export default async function AthletePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  
  if (!session?.user) {
    redirect('/login');
  }

  // Хак для in-memory демонстрации: устанавливаем глобальные переменные
  (global as any).__currentUserId = session.user.id;
  (global as any).__currentAthleteIdFromUrl = id;

  const athlete = await db.query.athletes.findFirst({
    where: and(
      eq(athletes.id, id),
      eq(athletes.userId, session.user.id)
    ),
  });

  if (!athlete) {
    redirect('/athletes');
  }

  // Получаем планы с упражнениями
  const athletePlans = await db.query.plans.findMany({
    where: eq(plans.athleteId, id),
    orderBy: (plans, { asc }) => [asc(plans.week), asc(plans.workoutNumber)],
  });

  // Для каждого плана получаем упражнения
  const plansWithExercises = await Promise.all(
    athletePlans.map(async (plan) => {
      const planExercisesList = await db.query.planExercises.findMany({
        where: eq(planExercises.planId, plan.id),
        orderBy: (planExercises, { asc }) => [asc(planExercises.orderIndex)],
      });

      const exercisesData = await Promise.all(
        planExercisesList.map(async (pe) => {
          const exercise = await db.query.exercises.findFirst({
            where: eq(exercises.id, pe.exerciseId),
          });
          return {
            name: exercise?.name || 'Unknown',
            targetWeight: pe.targetWeight,
            targetReps: pe.targetReps,
            targetSets: pe.targetSets,
            notes: pe.notes,
          };
        })
      );

      return {
        ...plan,
        exercises: exercisesData,
      };
    })
  );

  // Генерируем таблицы весов для каждого упражнения
  const squatTable = athlete.squatPM ? generateWeightTable(athlete.squatPM, undefined, athlete.roundingStep) : [];
  const benchTable = athlete.benchPM ? generateWeightTable(athlete.benchPM, undefined, athlete.roundingStep) : [];
  const deadliftTable = athlete.deadliftPM ? generateWeightTable(athlete.deadliftPM, undefined, athlete.roundingStep) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                PowerLift Tracker
              </Link>
              <Link href="/athletes" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Атлеты
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{session.user.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Заголовок */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">{athlete.name}</h2>
            <div className="space-x-3">
              <Link
                href={`/athletes/${athlete.id}/logs`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                📊 История тренировок
              </Link>
              <a
                href={`/api/athletes/${athlete.id}/export`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                📄 Экспорт
              </a>
              <Link
                href={`/plans/new?athleteId=${athlete.id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                + Добавить план
              </Link>
            </div>
          </div>

          {/* Текущие PM */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Личные максимумы (PM)
              {athlete.pmDate && (
                <span className="ml-2 text-sm text-gray-500">
                  от {new Date(athlete.pmDate).toLocaleDateString('ru-RU')}
                </span>
              )}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="border border-gray-200 rounded-md p-4">
                <p className="text-sm text-gray-500">Присед</p>
                <p className="text-2xl font-bold text-gray-900">
                  {athlete.squatPM ? `${athlete.squatPM} кг` : '—'}
                </p>
              </div>
              <div className="border border-gray-200 rounded-md p-4">
                <p className="text-sm text-gray-500">Жим</p>
                <p className="text-2xl font-bold text-gray-900">
                  {athlete.benchPM ? `${athlete.benchPM} кг` : '—'}
                </p>
              </div>
              <div className="border border-gray-200 rounded-md p-4">
                <p className="text-sm text-gray-500">Тяга</p>
                <p className="text-2xl font-bold text-gray-900">
                  {athlete.deadliftPM ? `${athlete.deadliftPM} кг` : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Таблицы весов */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Таблицы весов по процентам</h3>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Присед */}
              {athlete.squatPM && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Присед</h4>
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">%</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Вес</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {squatTable.map((row) => (
                          <tr key={row.percent}>
                            <td className="px-3 py-2 text-xs text-gray-900">{(row.percent * 100).toFixed(0)}%</td>
                            <td className="px-3 py-2 text-xs text-gray-900">{row.weight} кг</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Жим */}
              {athlete.benchPM && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Жим</h4>
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">%</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Вес</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {benchTable.map((row) => (
                          <tr key={row.percent}>
                            <td className="px-3 py-2 text-xs text-gray-900">{(row.percent * 100).toFixed(0)}%</td>
                            <td className="px-3 py-2 text-xs text-gray-900">{row.weight} кг</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Тяга */}
              {athlete.deadliftPM && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Тяга</h4>
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">%</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Вес</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {deadliftTable.map((row) => (
                          <tr key={row.percent}>
                            <td className="px-3 py-2 text-xs text-gray-900">{(row.percent * 100).toFixed(0)}%</td>
                            <td className="px-3 py-2 text-xs text-gray-900">{row.weight} кг</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* График прогресса PM */}
          {athlete.pmHistory && athlete.pmHistory.length > 1 && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">График прогресса</h3>
              <PMProgressChart pmHistory={athlete.pmHistory} />
            </div>
          )}

          {/* Планы тренировок */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Планы тренировок</h3>
            {plansWithExercises.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500">Пока нет планов</p>
                <Link
                  href={`/plans/new?athleteId=${athlete.id}`}
                  className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
                >
                  Добавить первый план
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {plansWithExercises.map((plan) => (
                  <div
                    key={plan.id}
                    className="border border-gray-200 rounded-md p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Неделя {plan.week}, Тренировка {plan.workoutNumber}
                          {plan.type === 'test' && ' • ПРОХОДКА'}
                        </h4>
                        {plan.notes && (
                          <p className="text-xs text-gray-500 mt-1">{plan.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        {plan.date && (
                          <span className="text-xs text-gray-500">
                            {new Date(plan.date).toLocaleDateString('ru-RU')}
                          </span>
                        )}
                        <Link
                          href={`/logs/new?planId=${plan.id}&athleteId=${athlete.id}`}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Записать результат
                        </Link>
                      </div>
                    </div>
                    
                    {/* Список упражнений */}
                    {plan.exercises.length > 0 && (
                      <div className="mt-3 space-y-2 bg-gray-50 p-3 rounded">
                        {plan.exercises.map((exercise, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="font-medium text-gray-700">{exercise.name}:</span>
                            {' '}
                            {exercise.targetWeight && `${exercise.targetWeight}кг`}
                            {exercise.targetReps && ` × ${exercise.targetReps}`}
                            {exercise.targetSets && ` × ${exercise.targetSets}`}
                            {exercise.notes && (
                              <span className="text-gray-500 ml-2">({exercise.notes})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

