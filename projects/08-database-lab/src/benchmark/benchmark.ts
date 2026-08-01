import fs from 'fs';
import path from 'path';
import { config } from '../config/config';
import { RawSQLiteLab } from '../sqlite/raw_sqlite';
import { ORMSQLitePrismaLab } from '../sqlite/orm_sqlite';
import { RawPostgresLab } from '../postgres/raw_postgres';
import { ORMPostgresPrismaLab } from '../postgres/orm_postgres';
import { RawMongoLab } from '../mongo/raw_mongo';
import { ODMMongoLab, TaskModel } from '../mongo/odm_mongo';
import { RedisCacheLab } from '../redis/redis_cache';

export interface BenchmarkMetrics {
  database: string;
  architecture: 'Raw SQL' | 'Prisma ORM' | 'Native Driver' | 'Mongoose ODM' | 'Native Client';
  operation: string;
  count: number;
  totalTimeMs: number;
  avgTimePerOpMs: number;
  opsPerSecond: number;
  status: 'SUCCESS' | 'SKIPPED_OFFLINE';
}

export class DatabaseBenchmarkRunner {
  private results: BenchmarkMetrics[] = [];
  private targetScale: number;

  constructor(scale: number = 100000) {
    this.targetScale = scale;
  }

  public async runAllBenchmarks(): Promise<BenchmarkMetrics[]> {
    console.log('\nStarting Database Lab Benchmarks...\n');

    await this.benchSQLite();
    await this.benchPostgreSQL();
    await this.benchMongoDB();
    await this.benchRedis();

    this.printFormattedSummary();
    return this.results;
  }

  private async benchSQLite(): Promise<void> {
    console.log(`[Bench] Running SQLite3 Benchmarks (${this.targetScale.toLocaleString()} items)...`);
    const dbFile = path.join(__dirname, 'sqlite_bench.db');
    const prismaDbFile = config.sqlite.prismaDbPath;

    // 1. SQLite Raw SQL Disk Benchmark (First)
    if (fs.existsSync(dbFile)) {
      try { fs.unlinkSync(dbFile); } catch (e) {}
    }

    try {
      const sqliteRaw = new RawSQLiteLab(dbFile);
      await sqliteRaw.init();

      const COUNT = this.targetScale;
      const BATCH_SIZE = 5000;
      
    // Raw SQL Bulk Insert
      const startRawInsert = Date.now();
      for (let i = 0; i < COUNT; i += BATCH_SIZE) {
        await sqliteRaw.runQuery('BEGIN TRANSACTION;');
        const placeholders: string[] = [];
        const values: any[] = [];
        const currentChunk = Math.min(BATCH_SIZE, COUNT - i);

        for (let j = 1; j <= currentChunk; j++) {
          placeholders.push('(?, ?, ?, ?, ?)');
          values.push(`SQLite Raw Task #${i + j}`, 'SQLite disk benchmark payload', 'todo', 'medium', 'Benchmark');
        }

        await sqliteRaw.runQuery(
          `INSERT INTO tasks (title, description, status, priority, category) VALUES ${placeholders.join(', ')}`,
          values
        );
        await sqliteRaw.runQuery('COMMIT;');
      }
      const rawInsertTime = Date.now() - startRawInsert;
      this.recordResult('SQLite3', 'Raw SQL', `Bulk Insert (${COUNT.toLocaleString()} items)`, COUNT, rawInsertTime);

    // Raw SQL Indexed Read
      const READ_COUNT = 1000;
      const startRawRead = Date.now();
      for (let i = 1; i <= READ_COUNT; i++) {
        await sqliteRaw.getOne('SELECT * FROM tasks WHERE id = ?', [i]);
      }
      const rawReadTime = Date.now() - startRawRead;
      this.recordResult('SQLite3', 'Raw SQL', `Indexed Read (${READ_COUNT.toLocaleString()} ops)`, READ_COUNT, rawReadTime);

      await sqliteRaw.close();
    } catch (e: any) {
      console.warn('[Bench] SQLite Raw SQL error:', e.message);
      this.recordSkipped('SQLite3', 'Raw SQL', `Bulk Insert (${this.targetScale.toLocaleString()} items)`);
      this.recordSkipped('SQLite3', 'Raw SQL', `Indexed Read (1,000 ops)`);
    } finally {
      if (fs.existsSync(dbFile)) {
        try { fs.unlinkSync(dbFile); } catch (e) {}
      }
    }

    // 2. SQLite Prisma ORM Benchmark (Second)
    console.log(`[Bench] Running SQLite3 Prisma ORM Benchmark (${this.targetScale.toLocaleString()} items)...`);
    const prismaOrm = new ORMSQLitePrismaLab(prismaDbFile);
    try {
      await prismaOrm.init();
      const COUNT = this.targetScale;
      const BATCH_SIZE = 5000;
      const READ_COUNT = 1000;
      const startPrismaInsert = Date.now();

      for (let i = 0; i < COUNT; i += BATCH_SIZE) {
        const chunk = Math.min(BATCH_SIZE, COUNT - i);
        const tasks = Array.from({ length: chunk }, (_, j) => ({
          title: `Prisma Task #${i + j + 1}`,
          description: 'Prisma ORM benchmark payload',
          status: 'todo',
          priority: 'medium',
          category: 'Benchmark',
        }));
        await prismaOrm.createMany(tasks);
      }
      const prismaInsertTime = Date.now() - startPrismaInsert;
      this.recordResult('SQLite3', 'Prisma ORM', `Bulk Insert (${COUNT.toLocaleString()} items)`, COUNT, prismaInsertTime);

      const startPrismaRead = Date.now();
      for (let i = 1; i <= READ_COUNT; i++) {
        await prismaOrm.findUnique(i);
      }
      const prismaReadTime = Date.now() - startPrismaRead;
      this.recordResult('SQLite3', 'Prisma ORM', `Indexed Read (${READ_COUNT.toLocaleString()} ops)`, READ_COUNT, prismaReadTime);

    } catch (e: any) {
      console.warn('[Bench] Prisma ORM skipped if tables not initialized:', e.message);
      this.recordSkipped('SQLite3', 'Prisma ORM', `Bulk Insert (${this.targetScale.toLocaleString()} items)`);
      this.recordSkipped('SQLite3', 'Prisma ORM', `Indexed Read (1,000 ops)`);
    } finally {
      try { await prismaOrm.close(); } catch (e) {}
    }
  }

  private async benchPostgreSQL(): Promise<void> {
    console.log(`[Bench] Running PostgreSQL Raw Benchmark (${this.targetScale.toLocaleString()} items)...`);
    const pgUrl = config.postgres.url;

    // 1. PostgreSQL Raw SQL (First)
    const pgRaw = new RawPostgresLab(pgUrl);
    try {
      await pgRaw.initTables();
      const COUNT = this.targetScale;
      const BATCH_SIZE = 2000;
      const startInsert = Date.now();

      for (let i = 0; i < COUNT; i += BATCH_SIZE) {
        const currentChunk = Math.min(BATCH_SIZE, COUNT - i);
        const valueStrings: string[] = [];
        const values: any[] = [];

        for (let j = 1; j <= currentChunk; j++) {
          const idx = (j - 1) * 6;
          valueStrings.push(`($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, $${idx + 6}::jsonb)`);
          values.push(
            `Postgres Task #${i + j}`,
            'Postgres high scale benchmark task payload',
            'todo',
            'high',
            'Benchmark',
            JSON.stringify(['bench', 'pg'])
          );
        }

        await pgRaw.query(
          `INSERT INTO pg_tasks (title, description, status, priority, category, tags) VALUES ${valueStrings.join(', ')};`,
          values
        );
      }

      const insertTime = Date.now() - startInsert;
      this.recordResult('PostgreSQL', 'Raw SQL', `Bulk Insert (${COUNT.toLocaleString()} items)`, COUNT, insertTime);

      const READ_COUNT = 1000;
      const startRead = Date.now();
      for (let i = 1; i <= READ_COUNT; i++) {
        await pgRaw.query('SELECT * FROM pg_tasks WHERE id = $1;', [i]);
      }
      const readTime = Date.now() - startRead;
      this.recordResult('PostgreSQL', 'Raw SQL', `Indexed Read (${READ_COUNT.toLocaleString()} ops)`, READ_COUNT, readTime);
    } catch (e: any) {
      console.warn('[Bench] PostgreSQL connection error:', e.message);
      this.recordSkipped('PostgreSQL', 'Raw SQL', `Bulk Insert (${this.targetScale.toLocaleString()} items)`);
      this.recordSkipped('PostgreSQL', 'Raw SQL', `Indexed Read (1,000 ops)`);
    } finally {
      try { await pgRaw.close(); } catch (e) {}
    }

    // 2. PostgreSQL Prisma ORM (Second)
    console.log(`[Bench] Running PostgreSQL Prisma ORM Benchmark (${this.targetScale.toLocaleString()} items)...`);
    const pgPrisma = new ORMPostgresPrismaLab(pgUrl);
    try {
      await pgPrisma.init();
      const COUNT = this.targetScale;
      const BATCH_SIZE = 2000;
      const startPrismaInsert = Date.now();

      for (let i = 0; i < COUNT; i += BATCH_SIZE) {
        const chunk = Math.min(BATCH_SIZE, COUNT - i);
        const tasks = Array.from({ length: chunk }, (_, j) => ({
          title: `Postgres Prisma Task #${i + j + 1}`,
          description: 'Prisma ORM benchmark payload',
          status: 'todo',
          priority: 'high',
          category: 'Benchmark',
        }));
        await pgPrisma.createMany(tasks);
      }
      const prismaInsertTime = Date.now() - startPrismaInsert;
      this.recordResult('PostgreSQL', 'Prisma ORM', `Bulk Insert (${COUNT.toLocaleString()} items)`, COUNT, prismaInsertTime);

      const READ_COUNT = 1000;
      const startPrismaRead = Date.now();
      for (let i = 1; i <= READ_COUNT; i++) {
        await pgPrisma.findUnique(i);
      }
      const prismaReadTime = Date.now() - startPrismaRead;
      this.recordResult('PostgreSQL', 'Prisma ORM', `Indexed Read (${READ_COUNT.toLocaleString()} ops)`, READ_COUNT, prismaReadTime);

    } catch (e: any) {
      console.warn('[Bench] PostgreSQL Prisma ORM skipped if tables missing:', e.message);
      this.recordSkipped('PostgreSQL', 'Prisma ORM', `Bulk Insert (${this.targetScale.toLocaleString()} items)`);
      this.recordSkipped('PostgreSQL', 'Prisma ORM', `Indexed Read (1,000 ops)`);
    } finally {
      try { await pgPrisma.close(); } catch (e) {}
    }
  }

  private async benchMongoDB(): Promise<void> {
    console.log(`[Bench] Running MongoDB Native Driver (${this.targetScale.toLocaleString()} items)...`);
    const mongoUri = config.mongo.uri;
    
    // 1. Native Mongo Driver (First)
    const mongoRaw = new RawMongoLab(mongoUri);
    try {
      await mongoRaw.connect();
      const COUNT = this.targetScale;
      const BATCH_SIZE = 5000;
      const startInsert = Date.now();

      for (let i = 0; i < COUNT; i += BATCH_SIZE) {
        const currentChunk = Math.min(BATCH_SIZE, COUNT - i);
        const docs = Array.from({ length: currentChunk }, (_, j) => ({
          title: `Mongo Native Task #${i + j + 1}`,
          description: 'Document insert performance test payload',
          status: 'todo' as const,
          priority: 'medium' as const,
          category: 'Benchmark',
          tags: ['mongo', 'bench'],
          subtasks: [],
          created_at: new Date(),
          updated_at: new Date(),
        }));
        await (mongoRaw as any).tasksCollection.insertMany(docs);
      }
      const insertTime = Date.now() - startInsert;
      this.recordResult('MongoDB', 'Native Driver', `Bulk Insert (${COUNT.toLocaleString()} items)`, COUNT, insertTime);

      const READ_COUNT = 1000;
      const startRead = Date.now();
      for (let i = 1; i <= READ_COUNT; i++) {
        await (mongoRaw as any).tasksCollection.findOne({ category: 'Benchmark' });
      }
      const readTime = Date.now() - startRead;
      this.recordResult('MongoDB', 'Native Driver', `Document Read (${READ_COUNT.toLocaleString()} ops)`, READ_COUNT, readTime);

    } catch (e: any) {
      console.warn('[Bench] MongoDB Native connection error:', e.message);
      this.recordSkipped('MongoDB', 'Native Driver', `Bulk Insert (${this.targetScale.toLocaleString()} items)`);
      this.recordSkipped('MongoDB', 'Native Driver', `Document Read (1,000 ops)`);
    } finally {
      try { await mongoRaw.close(); } catch (e) {}
    }

    // 2. Mongoose ODM (Second)
    console.log(`[Bench] Running MongoDB Mongoose ODM Benchmark (${this.targetScale.toLocaleString()} items)...`);
    const mongoOdm = new ODMMongoLab(mongoUri);
    try {
      await mongoOdm.connect();
      const COUNT = this.targetScale;
      const BATCH_SIZE = 5000;
      const startOdmInsert = Date.now();

      for (let i = 0; i < COUNT; i += BATCH_SIZE) {
        const currentChunk = Math.min(BATCH_SIZE, COUNT - i);
        const docs = Array.from({ length: currentChunk }, (_, j) => ({
          title: `Mongo Mongoose Task #${i + j + 1}`,
          description: 'Mongoose ODM insert test payload',
          status: 'todo' as const,
          priority: 'medium' as const,
          category: 'Benchmark',
          tags: ['mongoose', 'odm'],
          subtasks: [],
        }));
        await TaskModel.insertMany(docs);
      }
      const odmInsertTime = Date.now() - startOdmInsert;
      this.recordResult('MongoDB', 'Mongoose ODM', `Bulk Insert (${COUNT.toLocaleString()} items)`, COUNT, odmInsertTime);

      const READ_COUNT = 1000;
      const startOdmRead = Date.now();
      for (let i = 1; i <= READ_COUNT; i++) {
        await TaskModel.findOne({ category: 'Benchmark' });
      }
      const odmReadTime = Date.now() - startOdmRead;
      this.recordResult('MongoDB', 'Mongoose ODM', `Document Read (${READ_COUNT.toLocaleString()} ops)`, READ_COUNT, odmReadTime);

    } catch (e: any) {
      console.warn('[Bench] Mongoose ODM connection error:', e.message);
      this.recordSkipped('MongoDB', 'Mongoose ODM', `Bulk Insert (${this.targetScale.toLocaleString()} items)`);
      this.recordSkipped('MongoDB', 'Mongoose ODM', `Document Read (1,000 ops)`);
    } finally {
      try { await mongoOdm.disconnect(); } catch (e) {}
    }
  }

  private async benchRedis(): Promise<void> {
    console.log(`[Bench] Running Redis Pipelined Benchmark (${this.targetScale.toLocaleString()} ops)...`);
    const redisUrl = config.redis.url;
    const redis = new RedisCacheLab(redisUrl);

    try {
      await redis.connect();
      const COUNT = this.targetScale;
      const BATCH_SIZE = 5000;

      const startSet = Date.now();
      for (let i = 0; i < COUNT; i += BATCH_SIZE) {
        const chunk = Math.min(BATCH_SIZE, COUNT - i);
        const items = Array.from({ length: chunk }, (_, j) => ({
          key: `bench:redis:${i + j + 1}`,
          value: { id: i + j + 1, title: 'Redis Cache Payload', status: 'completed' },
          ttlSeconds: 300,
        }));
        await redis.setCachePipelined(items);
      }
      const setTime = Date.now() - startSet;
      this.recordResult('Redis', 'Native Client', `Pipelined Set (${COUNT.toLocaleString()} ops)`, COUNT, setTime);

      let totalHits = 0;
      const startGet = Date.now();
      for (let i = 0; i < COUNT; i += BATCH_SIZE) {
        const chunk = Math.min(BATCH_SIZE, COUNT - i);
        const keys = Array.from({ length: chunk }, (_, j) => `bench:redis:${i + j + 1}`);
        const hits = await redis.getCachePipelined(keys);
        totalHits += hits;
      }
      const getTime = Date.now() - startGet;
      this.recordResult('Redis', 'Native Client', `Pipelined Get (${COUNT.toLocaleString()} ops, ${totalHits.toLocaleString()} hits)`, COUNT, getTime);
    } catch (e: any) {
      console.warn('[Bench] Redis connection error:', e.message);
      this.recordSkipped('Redis', 'Native Client', `Pipelined Set (${this.targetScale.toLocaleString()} ops)`);
      this.recordSkipped('Redis', 'Native Client', `Pipelined Get (${this.targetScale.toLocaleString()} ops)`);
    } finally {
      try { await redis.close(); } catch (e) {}
    }
  }

  private recordResult(
    database: string,
    architecture: 'Raw SQL' | 'Prisma ORM' | 'Native Driver' | 'Mongoose ODM' | 'Native Client',
    operation: string,
    count: number,
    totalTimeMs: number
  ): void {
    const avgTimePerOpMs = totalTimeMs / count;
    const opsPerSecond = Math.round((count / (totalTimeMs || 1)) * 1000);

    this.results.push({
      database,
      architecture,
      operation,
      count,
      totalTimeMs,
      avgTimePerOpMs: Number(avgTimePerOpMs.toFixed(4)),
      opsPerSecond,
      status: 'SUCCESS',
    });
  }

  private recordSkipped(
    database: string,
    architecture: 'Raw SQL' | 'Prisma ORM' | 'Native Driver' | 'Mongoose ODM' | 'Native Client',
    operation: string
  ): void {
    this.results.push({
      database,
      architecture,
      operation,
      count: 0,
      totalTimeMs: 0,
      avgTimePerOpMs: 0,
      opsPerSecond: 0,
      status: 'OFFLINE' as any,
    });
  }

  private printFormattedSummary(): void {
    const dbs = ['SQLite3', 'PostgreSQL', 'MongoDB', 'Redis'];
    const allDbs = Array.from(new Set([...dbs, ...this.results.map((r) => r.database)]));

    // Guarantee that every database in allDbs has rows in results
    for (const dbName of allDbs) {
      const dbRows = this.results.filter((r) => r.database === dbName);
      if (dbRows.length === 0) {
        this.recordSkipped(dbName, dbName === 'MongoDB' ? 'Native Driver' : 'Native Client', `Bulk Insert (${this.targetScale.toLocaleString()} items)`);
      }
    }

    // Compact ops/s: e.g. 89606 -> "89.6K/s", 1200000 -> "1.2M/s"
    const fmtTput = (ops: number): string => {
      if (ops === 0) return '-';
      if (ops >= 1_000_000) return `${(ops / 1_000_000).toFixed(1)}M/s`;
      if (ops >= 1_000) return `${(ops / 1_000).toFixed(1)}K/s`;
      return `${ops}/s`;
    };

    // Compact latency: trim trailing zeroes
    const fmtLat = (ms: number): string => {
      if (ms === 0) return '-';
      return `${ms} ms`;
    };

    // Shorten op label: strip scale count from long Redis label to keep it compact
    const fmtOp = (op: string): string => {
      // "Pipelined Get (100,000 ops, 100,000 hits)" -> "Pipelined Get (100,000 ops, 100K hits)"
      return op.replace(/(\d{1,3}(?:,\d{3})+) hits\)/, (_, n) => {
        const num = parseInt(n.replace(/,/g, ''), 10);
        return `${num >= 1000 ? `${(num / 1000).toFixed(0)}K` : n} hits)`;
      });
    };

    const getFormattedRow = (r: BenchmarkMetrics) => ({
      dbStr:   r.database,
      archStr: r.architecture,
      opStr:   fmtOp(r.operation),
      cntStr:  r.count > 0 ? r.count.toLocaleString() : '-',
      timeStr: r.totalTimeMs > 0 ? `${r.totalTimeMs.toLocaleString()} ms` : '-',
      latStr:  fmtLat(r.avgTimePerOpMs),
      tputStr: fmtTput(r.opsPerSecond),
      statStr: r.status,
    });

    const formattedRows = this.results.map(getFormattedRow);

    // Fixed column widths sized to the actual data
    const colDb   = Math.max('Database'.length,     ...formattedRows.map((r) => r.dbStr.length),   ...allDbs.map((d) => d.length)) + 2;
    const colArch = Math.max('Architecture'.length, ...formattedRows.map((r) => r.archStr.length)) + 2;
    const colOp   = Math.max('Operation'.length,    ...formattedRows.map((r) => r.opStr.length))   + 2;
    const colCnt  = Math.max('Ops Count'.length,    ...formattedRows.map((r) => r.cntStr.length))  + 2;
    const colTime = Math.max('Total Time'.length,   ...formattedRows.map((r) => r.timeStr.length)) + 2;
    const colLat  = Math.max('Latency'.length,      ...formattedRows.map((r) => r.latStr.length))  + 2;
    const colTput = Math.max('Ops/s'.length,        ...formattedRows.map((r) => r.tputStr.length)) + 2;
    const colStat = Math.max('Status'.length,       ...formattedRows.map((r) => r.statStr.length)) + 2;

    const totalLineLen = colDb + colArch + colOp + colCnt + colTime + colLat + colTput + colStat + 9;
    const sep = `+${'-'.repeat(colDb)}+${'-'.repeat(colArch)}+${'-'.repeat(colOp)}+${'-'.repeat(colCnt)}+${'-'.repeat(colTime)}+${'-'.repeat(colLat)}+${'-'.repeat(colTput)}+${'-'.repeat(colStat)}+`;

    const bannerLine  = '='.repeat(totalLineLen);
    const titleText   = `DATABASE BENCHMARK SUMMARY (${this.targetScale.toLocaleString()} Ops)`;
    const titlePad    = Math.max(0, Math.floor((totalLineLen - titleText.length) / 2));

    console.log(`\n${bannerLine}`);
    console.log(' '.repeat(titlePad) + titleText);
    console.log(`${bannerLine}\n`);

    console.log(sep);
    console.log(
      `| ${'Database'.padEnd(colDb - 2)} | ${'Architecture'.padEnd(colArch - 2)} | ${'Operation'.padEnd(colOp - 2)} | ${'Ops Count'.padEnd(colCnt - 2)} | ${'Total Time'.padEnd(colTime - 2)} | ${'Latency'.padEnd(colLat - 2)} | ${'Ops/s'.padEnd(colTput - 2)} | ${'Status'.padEnd(colStat - 2)} |`
    );
    console.log(sep);

    for (const dbName of allDbs) {
      const dbRows = this.results.filter((r) => r.database === dbName);

      for (const r of dbRows) {
        const row = getFormattedRow(r);
        console.log(
          `| ${row.dbStr.padEnd(colDb - 2)} | ${row.archStr.padEnd(colArch - 2)} | ${row.opStr.padEnd(colOp - 2)} | ${row.cntStr.padEnd(colCnt - 2)} | ${row.timeStr.padEnd(colTime - 2)} | ${row.latStr.padEnd(colLat - 2)} | ${row.tputStr.padEnd(colTput - 2)} | ${row.statStr.padEnd(colStat - 2)} |`
        );
      }

      console.log(sep);
    }

    console.log(`\n${bannerLine}`);
    console.log(' COLUMN EXPLANATION:');
    console.log(' - Database    : Engine tested (SQLite3, PostgreSQL, MongoDB, Redis)');
    console.log(' - Architecture: Paradigm tested (Raw SQL, Prisma ORM, Native Driver, Mongoose ODM, Native Client)');
    console.log(' - Operation   : Workload type and dataset count');
    console.log(' - Latency     : Average time per operation in milliseconds');
    console.log(' - Ops/s       : Operations per second (Higher is Better)');
    console.log(' - Status      : Execution state (SUCCESS vs OFFLINE)');
    console.log(`${bannerLine}\n`);
  }
}

if (process.argv[1] && process.argv[1].endsWith('benchmark.ts')) {
  (async () => {
    const scaleArg = process.argv[2] ? parseInt(process.argv[2], 10) : 100000;
    const runner = new DatabaseBenchmarkRunner(scaleArg);
    await runner.runAllBenchmarks();
  })();
}