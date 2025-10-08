import type { Config } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL || './data/powerlift.db';

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;