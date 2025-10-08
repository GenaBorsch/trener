'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ImportExportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImportDocx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import/docx', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при импорте');
      }

      setSuccess(
        `Успешно импортировано: ${data.athleteName}, создано планов: ${data.plansCreated}`
      );

      // Перенаправляем на страницу атлета через 2 секунды
      setTimeout(() => {
        router.push(`/athletes/${data.athleteId}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при импорте');
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

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Импорт и Экспорт</h2>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Импорт из DOCX */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Импорт из DOCX
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Загрузите файл в формате DOCX с данными атлета и планами тренировок.
                Формат файла должен соответствовать экспортированному из приложения.
              </p>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <input
                    type="file"
                    accept=".docx"
                    onChange={handleImportDocx}
                    disabled={loading}
                    className="hidden"
                  />
                  {loading ? 'Импорт...' : '📄 Выбрать DOCX файл'}
                </label>
              </div>
            </div>

            {/* Импорт из Excel */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Импорт из Excel
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Функционал в разработке. Скоро вы сможете импортировать данные из Excel файлов.
              </p>
              <button
                disabled
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-400 bg-gray-100 cursor-not-allowed"
              >
                📊 Выбрать Excel файл (скоро)
              </button>
            </div>

            {/* Экспорт */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Экспорт в DOCX
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Для экспорта данных атлета в DOCX перейдите на страницу атлета и нажмите кнопку
                "Экспорт в DOCX".
              </p>
              <Link
                href="/athletes"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Перейти к списку атлетов
              </Link>
            </div>

            {/* Инструкция */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                💡 Формат файла для импорта
              </h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>Файл DOCX должен содержать:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Имя атлета в формате: "Имя: ИМЯ АТЛЕТА"</li>
                  <li>PM значения: "ПМ (дата):", "Присед: X кг", "Жим: X кг", "Тяга: X кг"</li>
                  <li>Планы по неделям: "Неделя 1", "Тренировка 1"</li>
                  <li>Упражнения в формате: "Присед: 50кг×6, 55кг×5×3"</li>
                </ul>
                <p className="mt-3">
                  Пример файла можно получить, экспортировав данные существующего атлета.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}





