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
        console.log('🏃 Поиск атлетов findMany:', options);
        console.log('🏃 Всего атлетов в памяти:', inMemoryStorage.athletes.length);
        console.log('🏃 Атлеты в памяти:', inMemoryStorage.athletes.map(a => ({ id: a.id, name: a.name, userId: a.userId })));
        let result = inMemoryStorage.athletes;
        
        // Фильтрация по userId - всегда фильтруем по глобальному userId
        const globalUserId = (global as any).__currentUserId;
        console.log('🏃 Глобальный userId:', globalUserId);
        
        if (globalUserId) {
          result = result.filter(athlete => athlete.userId === globalUserId);
          console.log('🏃 Атлеты после фильтрации по userId:', result.map(a => ({ id: a.id, name: a.name, userId: a.userId })));
        } else {
          console.log('🏃 Нет глобального userId, показываем всех атлетов');
        }
        
        console.log('🏃 Найдено атлетов:', result.length);
        return result;
      },
      findFirst: async (options?: any) => {
        console.log('🏃 Поиск атлета findFirst:', options);
        
        // Для демонстрации используем глобальные переменные
        const globalUserId = (global as any).__currentUserId;
        const globalAthleteId = (global as any).__currentAthleteId;
        
        let athlete = null;
        
        if (globalAthleteId) {
          athlete = inMemoryStorage.athletes.find(a => 
            a.id === globalAthleteId && 
            (!globalUserId || a.userId === globalUserId)
          );
          console.log('🏃 Поиск по ID:', globalAthleteId, 'найден:', !!athlete);
          // Очищаем глобальную переменную
          delete (global as any).__currentAthleteId;
        }
        
        // НЕ удаляем __currentUserId, так как он может понадобиться для других запросов
        
        console.log('🏃 Найден атлет:', athlete ? { id: athlete.id, name: athlete.name } : null);
        return athlete;
      },
    },
    exercises: {
      findMany: async (options?: any) => {
        console.log('💪 Поиск упражнений findMany:', options);
        let result = inMemoryStorage.exercises;
        
        // Фильтрация по userId если указано
        if (options?.where) {
          // Простая логика для демонстрации - фильтруем по userId
          const globalUserId = (global as any).__currentUserId;
          if (globalUserId) {
            result = result.filter(exercise => exercise.userId === globalUserId);
          }
        }
        
        console.log('💪 Найдено упражнений:', result.length);
        console.log('💪 Упражнения:', result.map(e => ({ id: e.id, name: e.name, userId: e.userId })));
        return result;
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
        console.log('💾 Вставка данных в таблицу:', table, data);
        
        if (table === 'users') {
          const newUser = { ...data, id: `user-${Date.now()}`, createdAt: new Date() };
          inMemoryStorage.users.push(newUser);
          console.log('👤 Создан пользователь:', newUser.id);
          return [newUser];
        }
        if (table === 'athletes') {
          const newAthlete = { 
            ...data, 
            id: `athlete-${Date.now()}`, 
            createdAt: new Date(),
            updatedAt: new Date()
          };
          inMemoryStorage.athletes.push(newAthlete);
          console.log('🏃 Создан атлет:', newAthlete.id, newAthlete.name);
          return [newAthlete];
        }
        if (table === 'exercises') {
          const newExercise = { 
            ...data, 
            id: `exercise-${Date.now()}`, 
            createdAt: new Date()
          };
          inMemoryStorage.exercises.push(newExercise);
          console.log('💪 Создано упражнение:', newExercise.id, newExercise.name);
          return [newExercise];
        }
        return [data];
      },
    }),
  }),
  update: (table: any) => ({
    set: (data: any) => ({
      where: (condition: any) => ({
        returning: () => {
          console.log('🔄 Обновление данных в таблице:', table, data);
          
          if (table === 'athletes') {
            const athleteId = (global as any).__currentAthleteId;
            const userId = (global as any).__currentUserId;
            
            if (athleteId) {
              const athleteIndex = inMemoryStorage.athletes.findIndex(a => 
                a.id === athleteId && (!userId || a.userId === userId)
              );
              
              if (athleteIndex !== -1) {
                inMemoryStorage.athletes[athleteIndex] = {
                  ...inMemoryStorage.athletes[athleteIndex],
                  ...data,
                  updatedAt: new Date()
                };
                console.log('🏃 Обновлен атлет:', athleteId);
                return [inMemoryStorage.athletes[athleteIndex]];
              }
            }
          }
          
          console.log('❌ Не удалось обновить запись');
          return [];
        },
      }),
    }),
  }),
  delete: (table: any) => ({
    where: (condition: any) => {
      console.log('🗑️ Удаление из таблицы:', table);
      
      if (table === 'athletes') {
        const athleteId = (global as any).__currentAthleteId;
        const userId = (global as any).__currentUserId;
        
        if (athleteId) {
          const athleteIndex = inMemoryStorage.athletes.findIndex(a => 
            a.id === athleteId && (!userId || a.userId === userId)
          );
          
          if (athleteIndex !== -1) {
            inMemoryStorage.athletes.splice(athleteIndex, 1);
            console.log('🏃 Удален атлет:', athleteId);
            return { success: true };
          }
        }
      }
      
      console.log('❌ Не удалось удалить запись');
      return { success: false };
    },
  }),
};

// Экспортируем схемы как заглушки
export const users = 'users';
export const athletes = 'athletes';
export const exercises = 'exercises';
export const plans = 'plans';
export const logs = 'logs';