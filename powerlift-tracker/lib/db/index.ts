// Заглушка для базы данных в serverless окружении
// В production используем глобальное in-memory хранилище для демонстрации

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
  userId: string;
  squatPM?: number;
  benchPM?: number;
  deadliftPM?: number;
  pmDate?: Date;
  pmHistory?: Array<{
    date: string;
    squat?: number;
    bench?: number;
    deadlift?: number;
  }>;
  roundingStep: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  description?: string;
  userId: string;
  isArchived: boolean;
  createdAt: Date;
}

// Глобальное in-memory хранилище для serverless окружения
function getGlobalStorage() {
  if (!(global as any).__inMemoryStorage) {
    console.log('🚀 Инициализация глобального хранилища с демо-данными');
    
    (global as any).__inMemoryStorage = {
      users: [] as User[],
      athletes: [] as Athlete[],
      exercises: [] as Exercise[],
    };

    // Создаем тестовых пользователей
    (global as any).__inMemoryStorage.users.push({
      id: 'trainer-user',
      email: 'trainer@powerlift.com',
      passwordHash: '$2b$10$sN..dmD.16HSM6rcKaYANuY8xFi9A5GHfHy60Y78cGBF563pTS6mC', // password123
      name: 'Тренер',
      createdAt: new Date(),
    });

    (global as any).__inMemoryStorage.users.push({
      id: 'demo-user-1',
      email: 'admin@example.com',
      passwordHash: '$2b$10$SsdFUqeNzN17pr31tA1BPu0cjxyrC/RqP4lyLMldd4pw.akMOC5Vy', // password
      name: 'Демо Тренер',
      createdAt: new Date(),
    });

    // Создаем демо-атлетов
    (global as any).__inMemoryStorage.athletes.push({
      id: 'athlete-demo-1',
      userId: 'trainer-user',
      name: 'Иван Петров',
      squatPM: 150,
      benchPM: 100,
      deadliftPM: 180,
      pmDate: new Date('2024-09-15'),
      pmHistory: [
        { date: '2024-09-15', squat: 150, bench: 100, deadlift: 180 },
        { date: '2024-08-15', squat: 145, bench: 95, deadlift: 175 },
      ],
      roundingStep: 2.5,
      createdAt: new Date('2024-09-01'),
      updatedAt: new Date('2024-09-15'),
    });

    (global as any).__inMemoryStorage.athletes.push({
      id: 'athlete-demo-2',
      userId: 'trainer-user',
      name: 'Мария Сидорова',
      squatPM: 80,
      benchPM: 50,
      deadliftPM: 100,
      pmDate: new Date('2024-10-01'),
      pmHistory: [
        { date: '2024-10-01', squat: 80, bench: 50, deadlift: 100 },
        { date: '2024-09-01', squat: 75, bench: 45, deadlift: 95 },
      ],
      roundingStep: 2.5,
      createdAt: new Date('2024-08-15'),
      updatedAt: new Date('2024-10-01'),
    });

    (global as any).__inMemoryStorage.athletes.push({
      id: 'athlete-demo-3',
      userId: 'trainer-user',
      name: 'Алексей Козлов',
      squatPM: 200,
      benchPM: 140,
      deadliftPM: 220,
      pmDate: new Date('2024-10-05'),
      pmHistory: [
        { date: '2024-10-05', squat: 200, bench: 140, deadlift: 220 },
        { date: '2024-09-05', squat: 195, bench: 135, deadlift: 215 },
        { date: '2024-08-05', squat: 190, bench: 130, deadlift: 210 },
      ],
      roundingStep: 2.5,
      createdAt: new Date('2024-07-20'),
      updatedAt: new Date('2024-10-05'),
    });

    (global as any).__inMemoryStorage.athletes.push({
      id: 'athlete-demo-4',
      userId: 'trainer-user',
      name: 'Елена Васильева',
      squatPM: 90,
      benchPM: 55,
      deadliftPM: 110,
      pmDate: new Date('2024-10-08'),
      pmHistory: [
        { date: '2024-10-08', squat: 90, bench: 55, deadlift: 110 },
      ],
      roundingStep: 2.5,
      createdAt: new Date('2024-10-01'),
      updatedAt: new Date('2024-10-08'),
    });

    // Создаем полный справочник упражнений
    const demoExercises = [
      // Ноги
      { name: 'Приседания со штангой', category: 'Ноги', description: 'Базовое упражнение для развития квадрицепсов, ягодиц и задней поверхности бедра' },
      { name: 'Жим ногами', category: 'Ноги', description: 'Упражнение на тренажере для развития мышц ног' },
      { name: 'Выпады с гантелями', category: 'Ноги', description: 'Функциональное упражнение для ног и ягодиц' },
      { name: 'Румынская тяга', category: 'Ноги', description: 'Упражнение для задней поверхности бедра и ягодиц' },
      { name: 'Подъемы на носки', category: 'Ноги', description: 'Упражнение для развития икроножных мышц' },
      { name: 'Болгарские приседания', category: 'Ноги', description: 'Односторонние приседания с возвышения' },
      
      // Грудь
      { name: 'Жим лежа', category: 'Грудь', description: 'Базовое упражнение для развития грудных мышц' },
      { name: 'Жим гантелей лежа', category: 'Грудь', description: 'Вариация жима для лучшей проработки грудных мышц' },
      { name: 'Отжимания на брусьях', category: 'Грудь', description: 'Упражнение с собственным весом для груди и трицепсов' },
      { name: 'Разводка гантелей', category: 'Грудь', description: 'Изолирующее упражнение для грудных мышц' },
      { name: 'Жим на наклонной скамье', category: 'Грудь', description: 'Упражнение для верхней части грудных мышц' },
      
      // Спина
      { name: 'Становая тяга', category: 'Спина', description: 'Базовое упражнение для всего тела, особенно спины' },
      { name: 'Подтягивания', category: 'Спина', description: 'Упражнение с собственным весом для широчайших мышц' },
      { name: 'Тяга штанги в наклоне', category: 'Спина', description: 'Базовое упражнение для развития толщины спины' },
      { name: 'Тяга верхнего блока', category: 'Спина', description: 'Упражнение на тренажере для широчайших мышц' },
      { name: 'Тяга горизонтального блока', category: 'Спина', description: 'Упражнение для средней части спины' },
      { name: 'Тяга гантели в наклоне', category: 'Спина', description: 'Односторонняя тяга для проработки широчайших' },
      
      // Плечи
      { name: 'Жим штанги стоя', category: 'Плечи', description: 'Базовое упражнение для развития дельтовидных мышц' },
      { name: 'Жим гантелей сидя', category: 'Плечи', description: 'Упражнение для развития передних и средних дельт' },
      { name: 'Разводка гантелей в стороны', category: 'Плечи', description: 'Изолирующее упражнение для средних дельт' },
      { name: 'Обратная разводка', category: 'Плечи', description: 'Упражнение для задних дельтовидных мышц' },
      { name: 'Подъемы перед собой', category: 'Плечи', description: 'Изолирующее упражнение для передних дельт' },
      
      // Руки
      { name: 'Подъем штанги на бицепс', category: 'Руки', description: 'Базовое упражнение для бицепсов' },
      { name: 'Жим узким хватом', category: 'Руки', description: 'Базовое упражнение для трицепсов' },
      { name: 'Французский жим', category: 'Руки', description: 'Изолирующее упражнение для трицепсов' },
      { name: 'Молотки с гантелями', category: 'Руки', description: 'Упражнение для бицепсов и предплечий' },
      { name: 'Подъемы на бицепс с гантелями', category: 'Руки', description: 'Классическое упражнение для бицепсов' },
      { name: 'Разгибания на трицепс', category: 'Руки', description: 'Изолирующее упражнение для трицепсов' },
      
      // Пресс
      { name: 'Планка', category: 'Пресс', description: 'Статическое упражнение для укрепления кора' },
      { name: 'Скручивания', category: 'Пресс', description: 'Классическое упражнение для прямой мышцы живота' },
      { name: 'Подъемы ног', category: 'Пресс', description: 'Упражнение для нижней части пресса' },
      { name: 'Велосипед', category: 'Пресс', description: 'Упражнение для косых мышц живота' },
    ];

    demoExercises.forEach((exercise, index) => {
      (global as any).__inMemoryStorage.exercises.push({
        id: `ex-demo-${index + 1}`,
        userId: 'trainer-user',
        name: exercise.name,
        category: exercise.category,
        description: exercise.description,
        isArchived: false,
        createdAt: new Date(),
      });
    });

    console.log('✅ Инициализация завершена:', {
      users: (global as any).__inMemoryStorage.users.length,
      athletes: (global as any).__inMemoryStorage.athletes.length,
      exercises: (global as any).__inMemoryStorage.exercises.length,
    });
  }

  return (global as any).__inMemoryStorage;
}

// Получаем ссылку на глобальное хранилище
const inMemoryStorage = getGlobalStorage();

// Заглушка для Drizzle ORM
export const db = {
  query: {
    users: {
      findFirst: async (options: any) => {
        console.log('🔍 Поиск пользователя:', options);
        console.log('📊 Пользователи в памяти:', inMemoryStorage.users.map(u => ({ id: u.id, email: u.email })));

        if (!options || !options.where) {
          return null;
        }

        // Извлекаем email из глобальной переменной, установленной в auth.config.ts
        const email = (global as any).__currentAuthEmail;

        console.log('📧 Используем глобальный email:', email);

        const user = inMemoryStorage.users.find(u => u.email === email);
        console.log('👤 Найден пользователь:', user ? { id: user.id, email: user.email } : null);

        return user || null;
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
        const globalUserId = (global as any).__currentUserId;
        if (globalUserId) {
          result = result.filter(exercise => exercise.userId === globalUserId);
        }
        
        console.log('💪 Найдено упражнений:', result.length);
        console.log('💪 Упражнения:', result.map(e => ({ id: e.id, name: e.name, userId: e.userId })));
        return result;
      },
    },
  },
  select: () => ({
    from: (table: any) => ({
      where: (condition: any) => ({
        execute: async () => {
          if (table === 'users') {
            // Простая заглушка для select from users where
            const email = (global as any).__currentAuthEmail;
            return inMemoryStorage.users.filter(u => u.email === email);
          }
          return [];
        },
      }),
      execute: async () => {
        if (table === 'users') return inMemoryStorage.users;
        if (table === 'athletes') return inMemoryStorage.athletes;
        if (table === 'exercises') return inMemoryStorage.exercises;
        return [];
      },
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
  // Добавляем заглушку для eq
  eq: (column: any, value: any) => ({ _column: column, _value: value }),
};

// Экспортируем схемы как заглушки
export const users = 'users';
export const athletes = 'athletes';
export const exercises = 'exercises';
export const plans = 'plans';
export const logs = 'logs';