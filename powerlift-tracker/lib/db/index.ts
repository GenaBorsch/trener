// Заглушка для базы данных в serverless окружении
// В production используем in-memory хранилище для демонстрации

interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
}

interface Athlete {
  id: string;
  name: string;
  birthDate: string;
  weight: number;
  height: number;
  userId: string;
  createdAt: Date;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  description?: string;
  createdAt: Date;
}

// In-memory хранилище для демонстрации
const inMemoryStorage = {
  users: [] as User[],
  athletes: [] as Athlete[],
  exercises: [] as Exercise[],
};

// Создаем тестовых пользователей при инициализации
if (inMemoryStorage.users.length === 0) {
  // Пользователь из QUICKSTART.md
  inMemoryStorage.users.push({
    id: 'trainer-user',
    email: 'trainer@powerlift.com',
    passwordHash: '$2b$10$sN..dmD.16HSM6rcKaYANuY8xFi9A5GHfHy60Y78cGBF563pTS6mC', // password123
    name: 'Тренер',
    createdAt: new Date(),
  });

  // Дополнительный демо пользователь
  inMemoryStorage.users.push({
    id: 'demo-user-1',
    email: 'admin@example.com',
    passwordHash: '$2b$10$SsdFUqeNzN17pr31tA1BPu0cjxyrC/RqP4lyLMldd4pw.akMOC5Vy', // password
    name: 'Демо Тренер',
    createdAt: new Date(),
  });

  // Добавляем базовые упражнения
  const basicExercises = [
    { name: 'Приседания', category: 'Ноги', description: 'Базовое упражнение для ног' },
    { name: 'Жим лежа', category: 'Грудь', description: 'Базовое упражнение для груди' },
    { name: 'Становая тяга', category: 'Спина', description: 'Базовое упражнение для спины' },
    { name: 'Жим стоя', category: 'Плечи', description: 'Базовое упражнение для плеч' },
    { name: 'Подтягивания', category: 'Спина', description: 'Упражнение с собственным весом' },
  ];

  basicExercises.forEach((exercise, index) => {
    inMemoryStorage.exercises.push({
      id: `exercise-${index + 1}`,
      name: exercise.name,
      category: exercise.category,
      description: exercise.description,
      createdAt: new Date(),
    });
  });
}

// Заглушка для Drizzle ORM API
export const db = {
  query: {
    users: {
      findFirst: async (options: any) => {
        console.log('🔍 Поиск пользователя:', options);
        console.log('📊 Пользователи в памяти:', inMemoryStorage.users.map(u => ({ id: u.id, email: u.email })));
        
        // Для in-memory демонстрации создаем простую заглушку
        // В реальном проекте используйте настоящую базу данных
        
        // Если есть глобальная переменная с email (хак для демонстрации)
        const globalEmail = (global as any).__currentAuthEmail;
        if (globalEmail) {
          console.log('📧 Используем глобальный email:', globalEmail);
          const user = inMemoryStorage.users.find(u => u.email === globalEmail);
          console.log('👤 Найден пользователь:', user ? { id: user.id, email: user.email } : null);
          // Очищаем глобальную переменную
          delete (global as any).__currentAuthEmail;
          return user || null;
        }
        
        console.log('❌ Не удалось найти email для поиска');
        return null;
      },
    },
    athletes: {
      findMany: async (options?: any) => {
        return inMemoryStorage.athletes;
      },
    },
    exercises: {
      findMany: async (options?: any) => {
        return inMemoryStorage.exercises;
      },
    },
  },
  select: () => ({
    from: (table: any) => ({
      where: (condition: any) => inMemoryStorage.users,
    }),
  }),
  insert: (table: any) => ({
    values: (data: any) => ({
      returning: () => {
        if (table === 'users') {
          const newUser = { ...data, id: `user-${Date.now()}`, createdAt: new Date() };
          inMemoryStorage.users.push(newUser);
          return [newUser];
        }
        if (table === 'athletes') {
          const newAthlete = { ...data, id: `athlete-${Date.now()}`, createdAt: new Date() };
          inMemoryStorage.athletes.push(newAthlete);
          return [newAthlete];
        }
        return [data];
      },
    }),
  }),
};

// Экспортируем схемы как заглушки
export const users = 'users';
export const athletes = 'athletes';
export const exercises = 'exercises';
export const plans = 'plans';
export const logs = 'logs';