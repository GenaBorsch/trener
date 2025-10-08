'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewAthletePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    squatPM: '',
    benchPM: '',
    deadliftPM: '',
    pmDate: new Date().toISOString().split('T')[0],
    roundingStep: '2.5',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/athletes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          squatPM: formData.squatPM ? parseFloat(formData.squatPM) : null,
          benchPM: formData.benchPM ? parseFloat(formData.benchPM) : null,
          deadliftPM: formData.deadliftPM ? parseFloat(formData.deadliftPM) : null,
          pmDate: formData.pmDate,
          roundingStep: parseFloat(formData.roundingStep),
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при создании атлета');
      }

      const athlete = await response.json();
      router.push(`/athletes/${athlete.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

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
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Новый атлет</h2>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Имя атлета *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="squatPM" className="block text-sm font-medium text-gray-700">
                  PM Присед (кг)
                </label>
                <input
                  type="number"
                  id="squatPM"
                  step="0.5"
                  value={formData.squatPM}
                  onChange={(e) => setFormData({ ...formData, squatPM: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="benchPM" className="block text-sm font-medium text-gray-700">
                  PM Жим (кг)
                </label>
                <input
                  type="number"
                  id="benchPM"
                  step="0.5"
                  value={formData.benchPM}
                  onChange={(e) => setFormData({ ...formData, benchPM: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="deadliftPM" className="block text-sm font-medium text-gray-700">
                  PM Тяга (кг)
                </label>
                <input
                  type="number"
                  id="deadliftPM"
                  step="0.5"
                  value={formData.deadliftPM}
                  onChange={(e) => setFormData({ ...formData, deadliftPM: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="pmDate" className="block text-sm font-medium text-gray-700">
                  Дата PM
                </label>
                <input
                  type="date"
                  id="pmDate"
                  value={formData.pmDate}
                  onChange={(e) => setFormData({ ...formData, pmDate: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="roundingStep" className="block text-sm font-medium text-gray-700">
                  Шаг округления (кг)
                </label>
                <select
                  id="roundingStep"
                  value={formData.roundingStep}
                  onChange={(e) => setFormData({ ...formData, roundingStep: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="0.5">0.5 кг</option>
                  <option value="1">1 кг</option>
                  <option value="2.5">2.5 кг</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/athletes"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Создание...' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}



