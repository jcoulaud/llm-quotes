import 'reflect-metadata';
import { DataSource } from 'typeorm';
// Use relative imports here so compiled JS resolves without path aliases
import { Quote } from '../entities/Quote';
import { CreateQuotesTable1736550000000 } from '../migrations/1736550000000-CreateQuotesTable';

const runMigrationsOnStartup = process.env.RUN_MIGRATIONS_ON_STARTUP === 'true';

const maxPool = parseInt(process.env.PGPOOL_MAX || '5', 10);
const connectionTimeoutMillis = parseInt(process.env.PG_CONNECTION_TIMEOUT_MS || '5000', 10);
const idleTimeoutMillis = parseInt(process.env.PG_IDLE_TIMEOUT_MS || '30000', 10);

const dataSourceOptions = {
  type: 'postgres' as const,
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: false,
  entities: [Quote],
  migrations: [CreateQuotesTable1736550000000],
  migrationsTableName: 'migrations',
  subscribers: [],
  ssl: {
    rejectUnauthorized: false,
  },
  extra: {
    max: maxPool,
    keepAlive: true,
    connectionTimeoutMillis,
    idleTimeoutMillis,
    application_name: 'lll-quotes',
  },
};

declare global {
  // eslint-disable-next-line no-var
  var __APP_DATA_SOURCE_MIG__: DataSource | undefined;
}

export const AppDataSource: DataSource =
  globalThis.__APP_DATA_SOURCE_MIG__ ?? new DataSource(dataSourceOptions);

if (!globalThis.__APP_DATA_SOURCE_MIG__) {
  globalThis.__APP_DATA_SOURCE_MIG__ = AppDataSource;
}

export async function initializeDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      if (runMigrationsOnStartup) {
        await AppDataSource.runMigrations();
      }
      console.log('Database connected successfully');
    }
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
  return AppDataSource;
}

