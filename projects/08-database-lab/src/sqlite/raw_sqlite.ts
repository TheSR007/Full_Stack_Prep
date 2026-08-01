import sqlite3 from 'sqlite3';
import { config } from '../config/config';

export interface TaskRecord {
  id?: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  due_date?: string;
  created_at?: string;
}

export interface SubtaskRecord {
  id?: number;
  task_id: number;
  title: string;
  is_completed: number;
}

export class RawSQLiteLab {
  private db: sqlite3.Database;

  constructor(dbPath: string = 'sqlite_bench.db') {
    this.db = new sqlite3.Database(dbPath);
  }

  public async init(): Promise<void> {
    await this.runQuery('PRAGMA foreign_keys = ON;');
    await this.runQuery('PRAGMA journal_mode = WAL;');

    await this.runQuery(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT CHECK(status IN ('todo', 'in_progress', 'completed')) DEFAULT 'todo',
        priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
        category TEXT DEFAULT 'General',
        due_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await this.runQuery(`
      CREATE TABLE IF NOT EXISTS subtasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        is_completed INTEGER DEFAULT 0,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      );
    `);

    await this.runQuery(`
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
      CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
    `);
  }

  public runQuery(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  public getOne<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row as T);
      });
    });
  }

  public getAll<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows as T[]);
      });
    });
  }

  // Real-life CRUD with ACID Transaction
  public async createTaskWithSubtasks(task: TaskRecord, subtasks: string[]): Promise<number> {
    await this.runQuery('BEGIN TRANSACTION;');
    try {
      const res = await this.runQuery(
        `INSERT INTO tasks (title, description, status, priority, category, due_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [task.title, task.description, task.status, task.priority, task.category, task.due_date || null]
      );
      const taskId = res.lastID;

      for (const title of subtasks) {
        await this.runQuery(
          `INSERT INTO subtasks (task_id, title, is_completed) VALUES (?, ?, 0)`,
          [taskId, title]
        );
      }

      await this.runQuery('COMMIT;');
      return taskId;
    } catch (err) {
      await this.runQuery('ROLLBACK;');
      throw err;
    }
  }

  public async getTaskAnalytics(): Promise<any> {
    const total = await this.getOne<{ count: number }>('SELECT COUNT(*) as count FROM tasks');
    const byStatus = await this.getAll<{ status: string; count: number }>(
      'SELECT status, COUNT(*) as count FROM tasks GROUP BY status'
    );
    const byPriority = await this.getAll<{ priority: string; count: number }>(
      'SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority'
    );

    return {
      totalTasks: total?.count || 0,
      byStatus,
      byPriority,
    };
  }

  public async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// Standalone verification execution if invoked directly
if (process.argv[1] && process.argv[1].endsWith('raw_sqlite.ts')) {
  (async () => {
    console.log('[SQLite Raw] Initializing SQLite database...');
    const lab = new RawSQLiteLab();
    await lab.init();

    const taskId = await lab.createTaskWithSubtasks(
      {
        title: 'Setup SQLite Benchmarking',
        description: 'Verify raw SQL query execution and transactions in SQLite3',
        status: 'in_progress',
        priority: 'high',
        category: 'Database Lab',
      },
      ['Configure PRAGMA WAL', 'Create tables', 'Execute transaction']
    );

    console.log(`[SQLite Raw] Task created with ID: ${taskId}`);
    const analytics = await lab.getTaskAnalytics();
    console.log('[SQLite Raw] Task Analytics:', JSON.stringify(analytics, null, 2));

    await lab.close();
  })();
}