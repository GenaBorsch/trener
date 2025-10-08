import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

// Используем SQLite для всех окружений
const databaseUrl = process.env.DATABASE_URL || './data/powerlift.db';

// Создаем подключение к SQLite базе данных
function createDatabaseConnection() {
  // Убираем префикс file: если он есть
  const dbPath = databaseUrl.replace('file:', '');
  const dbDir = path.dirname(dbPath);
  
  // Создаем папку data если её нет
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  const sqlite = new Database(dbPath);
  return drizzle(sqlite, { schema });
}

export const db = createDatabaseConnection();