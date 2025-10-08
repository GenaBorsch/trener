import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function TestSessionPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Тест сессии</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold">Session:</h2>
            <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>

          <div>
            <h2 className="font-semibold">User ID:</h2>
            <p className="text-lg">{session?.user?.id || 'НЕТ ID!'}</p>
            <p className="text-sm text-gray-600">Тип: {typeof session?.user?.id}</p>
          </div>

          <div>
            <h2 className="font-semibold">User:</h2>
            <pre className="bg-gray-100 p-4 rounded mt-2">
              {JSON.stringify(session?.user, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}





