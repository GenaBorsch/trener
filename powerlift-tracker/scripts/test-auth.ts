import { auth } from '../auth';

async function testAuth() {
  console.log('=== Тест аутентификации ===\n');

  try {
    const session = await auth();
    
    console.log('Сессия:', JSON.stringify(session, null, 2));
    
    if (session?.user) {
      console.log('\nДанные пользователя:');
      console.log('- ID:', session.user.id);
      console.log('- ID type:', typeof session.user.id);
      console.log('- Name:', session.user.name);
      console.log('- Email:', session.user.email);
    } else {
      console.log('Пользователь не авторизован');
    }
  } catch (error) {
    console.error('Ошибка при получении сессии:', error);
  }
}

testAuth();





