import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// User (тренер)
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Athlete (атлет)
export const athletes = sqliteTable('athletes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  // Текущие PM
  squatPM: real('squat_pm'),
  benchPM: real('bench_pm'),
  deadliftPM: real('deadlift_pm'),
  pmDate: integer('pm_date', { mode: 'timestamp' }),
  // История PM (JSON массив: [{date, squat, bench, deadlift}])
  pmHistory: text('pm_history', { mode: 'json' }).$type<Array<{
    date: string;
    squat: number | null;
    bench: number | null;
    deadlift: number | null;
  }>>(),
  // Настройки округления (0.5, 1, 2.5 кг)
  roundingStep: real('rounding_step').notNull().default(2.5),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Справочник упражнений
export const exercises = sqliteTable('exercises', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'), // Например: 'Ноги', 'Грудь', 'Спина', 'Руки'
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// План тренировок
export const plans = sqliteTable('plans', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  athleteId: text('athlete_id').notNull().references(() => athletes.id, { onDelete: 'cascade' }),
  week: integer('week').notNull(),
  workoutNumber: integer('workout_number').notNull(),
  date: integer('date', { mode: 'timestamp' }),
  // Тип тренировки (обычная или проходка)
  type: text('type', { enum: ['regular', 'test'] }).notNull().default('regular'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Упражнения в плане тренировки
export const planExercises = sqliteTable('plan_exercises', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  planId: text('plan_id').notNull().references(() => plans.id, { onDelete: 'cascade' }),
  exerciseId: text('exercise_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  orderIndex: integer('order_index').notNull().default(0), // Порядок упражнений в плане
  // Запланированные параметры
  targetWeight: real('target_weight'), // Целевой вес в кг
  targetReps: integer('target_reps'), // Целевое количество повторений
  targetSets: integer('target_sets'), // Целевое количество подходов
  notes: text('notes'), // Примечания к упражнению
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Лог результатов тренировок (общий)
export const workoutLogs = sqliteTable('workout_logs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  planId: text('plan_id').references(() => plans.id, { onDelete: 'set null' }),
  athleteId: text('athlete_id').notNull().references(() => athletes.id, { onDelete: 'cascade' }),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  // Общий комментарий к тренировке
  comment: text('comment'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Лог результатов упражнений
export const exerciseLogs = sqliteTable('exercise_logs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  workoutLogId: text('workout_log_id').notNull().references(() => workoutLogs.id, { onDelete: 'cascade' }),
  planExerciseId: text('plan_exercise_id').references(() => planExercises.id, { onDelete: 'set null' }),
  exerciseId: text('exercise_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  // Фактические результаты
  actualWeight: real('actual_weight'), // Фактический вес в кг
  actualReps: integer('actual_reps'), // Фактическое количество повторений
  actualSets: integer('actual_sets'), // Фактическое количество подходов
  // Комментарий к упражнению (например: "легко", "тяжело", "задавила с середины")
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Типы для TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Athlete = typeof athletes.$inferSelect;
export type NewAthlete = typeof athletes.$inferInsert;

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;

export type PlanExercise = typeof planExercises.$inferSelect;
export type NewPlanExercise = typeof planExercises.$inferInsert;

export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type NewWorkoutLog = typeof workoutLogs.$inferInsert;

export type ExerciseLog = typeof exerciseLogs.$inferSelect;
export type NewExerciseLog = typeof exerciseLogs.$inferInsert;

// Relations
export const plansRelations = relations(plans, ({ many }) => ({
  planExercises: many(planExercises)
}));

export const planExercisesRelations = relations(planExercises, ({ one }) => ({
  plan: one(plans, {
    fields: [planExercises.planId],
    references: [plans.id]
  }),
  exercise: one(exercises, {
    fields: [planExercises.exerciseId],
    references: [exercises.id]
  })
}));

