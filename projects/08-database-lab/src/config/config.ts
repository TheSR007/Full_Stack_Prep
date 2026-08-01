import 'dotenv/config';
import path from 'path';

export const config = {
  postgres: {
    url: process.env.POSTGRE_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/task_db',
    dbName: 'task_db',
  },
  sqlite: {
    url: process.env.SQLITE_DATABASE_URL || 'file:./sqlite_bench.db',
    benchDbPath: path.join(__dirname, '../benchmark/sqlite_bench.db'),
    prismaDbPath: process.env.SQLITE_DATABASE_URL || `file:${path.join(__dirname, '../../prisma/sqlite_bench.db')}`,
  },
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGO_DB_NAME || 'task_lab',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
};