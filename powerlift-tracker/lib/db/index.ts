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

// Создаем тестового пользователя при инициализации
if (inMemoryStorage.users.length === 0) {
  inMemoryStorage.users.push({
    id: 'demo-user-1',
    email: 'admin@example.com',
    passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
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
        const user = inMemoryStorage.users.find(u => 
          options.where && u.email === options.where.email
        );
        return user || null;
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