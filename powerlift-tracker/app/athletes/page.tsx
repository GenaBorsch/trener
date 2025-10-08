import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { athletes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';

export default async function AthletesPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const allAthletes = await db.query.athletes.findMany({
    where: eq(athletes.userId, session.user.id),
    orderBy: (athletes, { desc }) => [desc(athletes.createdAt)],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                PowerLift Tracker
              </Link>
              <Link href="/athletes" className="text-sm font-medium text-blue-600">
                Атлеты
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{session.user.name}</span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Выход
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Атлеты</h2>
            <Link
              href="/athletes/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              + Добавить атлета
            </Link>
          </div>

          {allAthletes.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">Пока нет атлетов</p>
              <Link
                href="/athletes/new"
                className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
              >
                Добавить первого атлета
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Имя
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PM Присед
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PM Жим
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PM Тяга
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата PM
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allAthletes.map((athlete) => (
                    <tr key={athlete.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/athletes/${athlete.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          {athlete.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {athlete.squatPM ? `${athlete.squatPM} кг` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {athlete.benchPM ? `${athlete.benchPM} кг` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {athlete.deadliftPM ? `${athlete.deadliftPM} кг` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {athlete.pmDate
                          ? new Date(athlete.pmDate).toLocaleDateString('ru-RU')
                          : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/athletes/${athlete.id}`}
                          className="text-blue-600 hover:text-blue-700 mr-4"
                        >
                          Просмотр
                        </Link>
                        <Link
                          href={`/athletes/${athlete.id}/edit`}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          Редактировать
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}




