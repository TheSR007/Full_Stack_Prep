import { Pool, QueryResult } from 'pg';
import { config } from '../config/config';

export interface PostgresTaskRecord {
  id?: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  tags?: string[];
  metadata?: Record<string, any>;
  due_date?: string;
  created_at?: string;
}

export class RawPostgresLab {
  private pool: Pool;

  constructor(connectionString?: string) {
    this.pool = new Pool({
      connectionString: connectionString || config.postgres.url,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  public async query(text: string, params: any[] = []): Promise<QueryResult> {
    return this.pool.query(text, params);
  }

  public async initTables(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS pg_tasks (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'todo',
          priority VARCHAR(50) DEFAULT 'medium',
          category VARCHAR(100) DEFAULT 'General',
          tags JSONB DEFAULT '[]'::jsonb,
          metadata JSONB DEFAULT '{}'::jsonb,
          due_date TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          search_vector TSVECTOR GENERATED ALWAYS AS (
            to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
          ) STORED
        );
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_pg_tasks_tags ON pg_tasks USING gin (tags);
        CREATE INDEX IF NOT EXISTS idx_pg_tasks_search ON pg_tasks USING gin (search_vector);
        CREATE INDEX IF NOT EXISTS idx_pg_tasks_metadata ON pg_tasks USING gin (metadata);
      `);
    } finally {
      client.release();
    }
  }

  // Real-life PostgreSQL Feature: Full-Text Search
  public async searchTasksFullText(searchTerm: string): Promise<PostgresTaskRecord[]> {
    const res = await this.pool.query(
      `SELECT id, title, description, status, priority, category, tags, metadata, due_date, created_at,
              ts_rank(search_vector, to_tsquery('english', $1)) AS rank
       FROM pg_tasks
       WHERE search_vector @@ to_tsquery('english', $1)
       ORDER BY rank DESC;`,
      [searchTerm.replace(/\s+/g, ' & ')]
    );
    return res.rows;
  }

  // Real-life PostgreSQL Feature: JSONB Querying & Path Operations
  public async findTasksByTag(tag: string): Promise<PostgresTaskRecord[]> {
    const res = await this.pool.query(
      `SELECT * FROM pg_tasks WHERE tags @> $1::jsonb;`,
      [JSON.stringify([tag])]
    );
    return res.rows;
  }

  // Real-life PostgreSQL Feature: CTE (Common Table Expressions) & Advanced Aggregation
  public async getAdvancedAnalyticsCTE(): Promise<any> {
    const res = await this.pool.query(`
      WITH task_summary AS (
        SELECT 
          status,
          priority,
          COUNT(*) as count,
          jsonb_agg(jsonb_build_object('id', id, 'title', title)) as item_list
        FROM pg_tasks
        GROUP BY status, priority
      ),
      total_stats AS (
        SELECT COUNT(*) as total_count FROM pg_tasks
      )
      SELECT 
        total_stats.total_count,
        jsonb_agg(
          jsonb_build_object(
            'status', task_summary.status,
            'priority', task_summary.priority,
            'count', task_summary.count,
            'items', task_summary.item_list
          )
        ) as summary_breakdown
      FROM total_stats, task_summary
      GROUP BY total_stats.total_count;
    `);
    return res.rows[0] || { total_count: 0, summary_breakdown: [] };
  }

  // Transaction with Client Checkout
  public async insertTaskWithTransaction(task: PostgresTaskRecord): Promise<PostgresTaskRecord> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const res = await client.query(
        `INSERT INTO pg_tasks (title, description, status, priority, category, tags, metadata, due_date)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8)
         RETURNING *;`,
        [
          task.title,
          task.description,
          task.status || 'todo',
          task.priority || 'medium',
          task.category || 'General',
          JSON.stringify(task.tags || []),
          JSON.stringify(task.metadata || {}),
          task.due_date || null,
        ]
      );
      await client.query('COMMIT');
      return res.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}

if (process.argv[1] && process.argv[1].endsWith('raw_postgres.ts')) {
  (async () => {
    console.log('[PostgreSQL Raw] Testing PostgreSQL client connection...');
    const lab = new RawPostgresLab();
    try {
      await lab.initTables();
      const task = await lab.insertTaskWithTransaction({
        title: 'PostgreSQL Full-Text Search & JSONB Lab',
        description: 'Demonstrating GIN indexing and tsvector search',
        status: 'in_progress',
        priority: 'urgent',
        category: 'Database',
        tags: ['postgres', 'jsonb', 'fts'],
        metadata: { client: 'ts-node', test_run: 1 },
      });
      console.log('[PostgreSQL Raw] Task created:', task.id);

      const ftsResults = await lab.searchTasksFullText('PostgreSQL & Search');
      console.log('[PostgreSQL Raw] FTS Query Results Count:', ftsResults.length);

      const jsonbResults = await lab.findTasksByTag('postgres');
      console.log('[PostgreSQL Raw] JSONB Tag Search Count:', jsonbResults.length);
    } catch (e: any) {
      console.error('[PostgreSQL Raw] Note: PostgreSQL server connection skipped if not running locally:', e.message);
    } finally {
      await lab.close();
    }
  })();
}