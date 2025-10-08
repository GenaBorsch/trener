import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function Home() {
  const session = await auth();
  
  // Если пользователь авторизован, перенаправляем на dashboard
  if (session?.user) {
    redirect('/dashboard');
  }
  
  // Иначе перенаправляем на страницу логина
  redirect('/login');
}
