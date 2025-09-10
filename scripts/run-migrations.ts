import 'reflect-metadata';
import { initializeDatabase } from '../src/lib/db';

async function run() {
  try {
    const ds = await initializeDatabase();
    await ds.runMigrations();
    console.log('Migrations ran successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration run failed:', err);
    process.exit(1);
  }
}

run();
