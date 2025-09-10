import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.local (if present) then .env
const cwd = process.cwd();
const envLocal = path.join(cwd, '.env.local');
if (fs.existsSync(envLocal)) dotenv.config({ path: envLocal });
dotenv.config();
import { initializeDatabase } from '../src/lib/db';

async function run() {
  try {
    const ds = await initializeDatabase();
    try {
      await ds.runMigrations();
      console.log('Migrations ran successfully');
      process.exit(0);
    } finally {
      // Ensure we close all DB connections
      if (ds && ds.isInitialized) {
        await ds.destroy();
      }
    }
  } catch (err) {
    console.error('Migration run failed:', err);
    process.exit(1);
  }
}

run();
