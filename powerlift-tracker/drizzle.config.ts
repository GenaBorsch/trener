import type { Config } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL or NETLIFY_DATABASE_URL must be set');
}

// Определяем диалект по URL
const isPostgreSQL = databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://');

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: isPostgreSQL ? 'postgresql' : 'sqlite',
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;



