'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Exercise {
  id: string;
  name: string;
  category?: string | null;
}

interface PlanExercise {
  exerciseId: string;
  exerciseName: string;
  targetWeight: string;
  targetReps: string;
  targetSets: string;
  notes: string;
}

export default function NewPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const athleteId = searchParams.get('athleteId');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [athlete, setAthlete] = useState<any>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [formData, setFormData] = useState({
    week: '1',
    workoutNumber: '1',
    date: '',
    type: 'regular' as 'regular' | 'test',
    notes: '',
  });

  const [planExercises, setPlanExercises] = useState<PlanExercise[]>([]);

  useEffect(() => {
    if (!athleteId) {
      router.push('/athletes');
      return;
    }

    // Загружаем данные атлета и упражнения
    Promise.all([
      fetch(`/api/athletes/${athleteId}`).then((res) => res.json()),
      fetch('/api/exercises').then((res) => res.json()),
    ]).then(([athleteData, exercisesData]) => {
      setAthlete(athleteData);
      setExercises(exercisesData);
    }).catch((err) => setError('Не удалось загрузить данные'));
  }, [athleteId, router]);

  const addExercise = () => {
    setPlanExercises([
      ...planExercises,
      {
        exerciseId: exercises[0]?.id || '',
        exerciseName: exercises[0]?.name || '',
        targetWeight: '',
        targetReps: '',
        targetSets: '',
        notes: '',
      },
    ]);
  };

  const removeExercise = (index: number) => {
    setPlanExercises(planExercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof PlanExercise, value: string) => {
    const updated = [...planExercises];
    updated[index] = { ...updated[index], [field]: value };
    
    // Если меняем упражнение, обновляем его название
    if (field === 'exerciseId') {
      const exercise = exercises.find((e) => e.id === value);
      if (exercise) {
        updated[index].exerciseName = exercise.name;
      }
    }
    
    setPlanExercises(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (planExercises.length === 0) {
        setError('Добавьте хотя бы одно упражнение');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          athleteId,
          week: parseInt(formData.week),
          workoutNumber: parseInt(formData.workoutNumber),
          date: formData.date || null,
          type: formData.type,
          notes: formData.notes || undefined,
          exercises: planExercises.map((ex, index) => ({
            exerciseId: ex.exerciseId,
            orderIndex: index,
            targetWeight: ex.targetWeight ? parseFloat(ex.targetWeight) : null,
            targetReps: ex.targetReps ? parseInt(ex.targetReps) : null,
            targetSets: ex.targetSets ? parseInt(ex.targetSets) : null,
            notes: ex.notes || null,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при создании плана');
      }

      router.push(`/athletes/${athleteId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  if (!athleteId) {
    return null;
  }

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
              {athlete && (
                <Link
                  href={`/athletes/${athleteId}`}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  {athlete.name}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Новый план тренировки
              {athlete && <span className="text-gray-600"> - {athlete.name}</span>}
            </h2>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Базовая информация */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Информация о тренировке</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="week" className="block text-sm font-medium text-gray-700">
                    Неделя *
                  </label>
                  <input
                    type="number"
                    id="week"
                    required
                    min="1"
                    value={formData.week}
                    onChange={(e) => setFormData({ ...formData, week: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="workoutNumber" className="block text-sm font-medium text-gray-700">
                    № Тренировки *
                  </label>
                  <input
                    type="number"
                    id="workoutNumber"
                    required
                    min="1"
                    value={formData.workoutNumber}
                    onChange={(e) => setFormData({ ...formData, workoutNumber: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Дата
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Тип тренировки
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'regular' | 'test' })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="regular">Обычная</option>
                    <option value="test">Проходка</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Примечания
                  </label>
                  <input
                    type="text"
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Упражнения */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Упражнения</h3>
                <button
                  type="button"
                  onClick={addExercise}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                >
                  + Добавить упражнение
                </button>
              </div>

              {planExercises.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Нажмите "Добавить упражнение" чтобы начать
                </p>
              ) : (
                <div className="space-y-4">
                  {planExercises.map((exercise, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-gray-700">Упражнение {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeExercise(index)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Удалить
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Выберите упражнение *
                          </label>
                          <select
                            required
                            value={exercise.exerciseId}
                            onChange={(e) => updateExercise(index, 'exerciseId', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            {exercises.map((ex) => (
                              <option key={ex.id} value={ex.id}>
                                {ex.name} {ex.category && `(${ex.category})`}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Вес (кг)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={exercise.targetWeight}
                            onChange={(e) => updateExercise(index, 'targetWeight', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Повторения
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={exercise.targetReps}
                            onChange={(e) => updateExercise(index, 'targetReps', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Подходы
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={exercise.targetSets}
                            onChange={(e) => updateExercise(index, 'targetSets', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Примечание
                          </label>
                          <input
                            type="text"
                            value={exercise.notes}
                            onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                            placeholder="Например: разминка"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Кнопки */}
            <div className="flex justify-end space-x-4">
              <Link
                href={`/athletes/${athleteId}`}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </Link>
              <button
                type="submit"
                disabled={loading || planExercises.length === 0}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Создание...' : 'Создать план'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
