import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Quote } from '@/entities/Quote';

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: !isProduction, // Auto-sync in dev, migrations in prod
  logging: false,
  entities: [Quote],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
  ssl: {
    rejectUnauthorized: false,
  },
});

let initialized = false;

export async function initializeDatabase() {
  if (!initialized) {
    try {
      await AppDataSource.initialize();
      initialized = true;
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Error connecting to database:', error);
      throw error;
    }
  }
  return AppDataSource;
}