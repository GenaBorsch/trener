import * as schema from './schema';

// Определяем тип базы данных по URL
const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL or NETLIFY_DATABASE_URL must be set');
}

// Функция для создания подключения к базе данных
function createDatabaseConnection() {
  // Используем PostgreSQL для production (Netlify) и SQLite для разработки
  if (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://')) {
    // PostgreSQL для Netlify
    const { drizzle } = require('drizzle-orm/neon-http');
    const { neon } = require('@neondatabase/serverless');
    
    const sql = neon(databaseUrl);
    return drizzle(sql, { schema });
  } else {
    // SQLite для локальной разработки
    const { drizzle } = require('drizzle-orm/better-sqlite3');
    const Database = require('better-sqlite3');
    const path = require('path');
    const fs = require('fs');
    
    // Создаем папку data если её нет
    const dbPath = databaseUrl.replace('file:', '');
    const dbDir = path.dirname(dbPath);
    
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    const sqlite = new Database(dbPath);
    return drizzle(sqlite, { schema });
  }
}

export const db = createDatabaseConnection();



