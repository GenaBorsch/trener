'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Exercise {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  isArchived: boolean;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
  });

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const response = await fetch('/api/exercises');
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: '', description: '', category: '' });
        setShowForm(false);
        loadExercises();
      }
    } catch (error) {
      console.error('Error creating exercise:', error);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Архивировать это упражнение?')) return;
    
    try {
      await fetch(`/api/exercises/${id}`, { method: 'DELETE' });
      loadExercises();
    } catch (error) {
      console.error('Error archiving exercise:', error);
    }
  };

  // Группируем по категориям
  const groupedExercises = exercises.reduce((acc, exercise) => {
    const category = exercise.category || 'Без категории';
    if (!acc[category]) acc[category] = [];
    acc[category].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                PowerLift Tracker
              </Link>
              <Link href="/exercises" className="text-sm font-medium text-blue-600">
                Справочник упражнений
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Справочник упражнений</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {showForm ? 'Отмена' : '+ Добавить упражнение'}
            </button>
          </div>

          {/* Форма добавления */}
          {showForm && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Новое упражнение</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Название *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Категория
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Например: Ноги, Грудь, Спина"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Описание
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Сохранить
                </button>
              </form>
            </div>
          )}

          {/* Список упражнений */}
          {loading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : (
            <div className="space-y-6">
              {Object.keys(groupedExercises).sort().map((category) => (
                <div key={category} className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{category}</h3>
                  <div className="space-y-3">
                    {groupedExercises[category].map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex justify-between items-start p-3 border border-gray-200 rounded-md hover:border-blue-300"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                          {exercise.description && (
                            <p className="text-sm text-gray-500 mt-1">{exercise.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleArchive(exercise.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Архивировать
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}





