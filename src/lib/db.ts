import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Quote } from '../entities/Quote';
import { Favorite } from '../entities/Favorite';
import { Vote } from '../entities/Vote';
import { User } from '../entities/User';
import { CreateQuotesTable1736550000000 } from '../migrations/1736550000000-CreateQuotesTable';
import { RemoveApprovedStatus1757462400000 } from '../migrations/1757462400000-RemoveApprovedStatus';
import { CreateFavoritesTable1757605000000 } from '../migrations/1757605000000-CreateFavoritesTable';
import { AddUsersAndLinkFavorites1757610000000 } from '../migrations/1757610000000-AddUsersAndLinkFavorites';
import { AlterUsersAddDeletedAndLastSeen1757611000000 } from '../migrations/1757611000000-AlterUsersAddDeletedAndLastSeen';
import { CreateVotesTable1757612000000 } from '../migrations/1757612000000-CreateVotesTable';
import { SetUsersIdDefault1757613000000 } from '../migrations/1757613000000-SetUsersIdDefault';

const runMigrationsOnStartup = process.env.RUN_MIGRATIONS_ON_STARTUP === 'true';

const maxPool = parseInt(process.env.PGPOOL_MAX || '5', 10);
const connectionTimeoutMillis = parseInt(process.env.PG_CONNECTION_TIMEOUT_MS || '5000', 10);
const idleTimeoutMillis = parseInt(process.env.PG_IDLE_TIMEOUT_MS || '30000', 10);

function computeSslOption(): boolean | undefined {
  const url = process.env.DATABASE_URL || '';
  const sslEnv = (process.env.PGSSL || process.env.PGSSLMODE || '').toLowerCase();

  // Explicit env overrides
  if (sslEnv === 'disable' || sslEnv === 'false' || sslEnv === 'off') return undefined;
  if (sslEnv === 'require' || sslEnv === 'true' || sslEnv === 'on') return true;

  // Connection string hints
  const urlHintsRequire = /([?&])ssl=true(\b|&)/i.test(url) || /([?&])sslmode=require(\b|&)/i.test(url);
  if (urlHintsRequire) return true;

  // Default: leave undefined (pg will not use SSL)
  return undefined;
}

const dataSourceOptions = {
  type: 'postgres' as const,
  url: process.env.DATABASE_URL,
  // Always use migrations; avoid synchronize even in dev
  synchronize: false,
  logging: false,
  entities: [Quote, Favorite, User, Vote],
  // Use explicit classes so Next bundles migrations in production
  migrations: [
    CreateQuotesTable1736550000000,
    RemoveApprovedStatus1757462400000,
    CreateFavoritesTable1757605000000,
    AddUsersAndLinkFavorites1757610000000,
    AlterUsersAddDeletedAndLastSeen1757611000000,
    CreateVotesTable1757612000000,
    SetUsersIdDefault1757613000000,
  ],
  migrationsTableName: 'migrations',
  subscribers: [],
  ssl: computeSslOption(),
  // Pass through to node-postgres (pg) for Neon-friendly pooling
  extra: {
    max: maxPool,
    keepAlive: true,
    connectionTimeoutMillis,
    idleTimeoutMillis,
    application_name: 'lll-quotes',
  },
};

declare global {
  var __APP_DATA_SOURCE__: DataSource | undefined;
}

export const AppDataSource: DataSource =
  globalThis.__APP_DATA_SOURCE__ ?? new DataSource(dataSourceOptions);

if (!globalThis.__APP_DATA_SOURCE__) {
  globalThis.__APP_DATA_SOURCE__ = AppDataSource;
}

export async function initializeDatabase() {
  try {
    // Recreate the DataSource if it's initialized but missing new entity metadata (HMR-safe)
    const ensureMetadata = async () => {
      if (AppDataSource.isInitialized) {
        try {
          // Accessing repositories will throw if metadata is missing
          AppDataSource.getRepository('quotes');
          AppDataSource.getRepository('favorites');
          AppDataSource.getRepository('users');
          AppDataSource.getRepository('votes');
          return; // all good
        } catch {
          try {
            await AppDataSource.destroy();
          } catch {}
          const fresh = new DataSource(dataSourceOptions);
          globalThis.__APP_DATA_SOURCE__ = fresh;
          // @ts-expect-error rebind exported reference in dev HMR
          (global as DataSource).AppDataSource = fresh;
        }
      }
    };

    await ensureMetadata();

    if (!globalThis.__APP_DATA_SOURCE__?.isInitialized) {
      const ds = globalThis.__APP_DATA_SOURCE__ ?? new DataSource(dataSourceOptions);
      if (!globalThis.__APP_DATA_SOURCE__) {
        globalThis.__APP_DATA_SOURCE__ = ds;
      }
      await ds.initialize();
      if (runMigrationsOnStartup) {
        await ds.runMigrations();
      }
      console.log('Database connected successfully');
    }
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
  return globalThis.__APP_DATA_SOURCE__ as DataSource;
}
