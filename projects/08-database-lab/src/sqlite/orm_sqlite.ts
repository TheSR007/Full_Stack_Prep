import { config } from '../config/config';

let PrismaClientSqlite: any;
try {
  PrismaClientSqlite = require('../../prisma/sqlite-client').PrismaClient;
} catch (e) {
  try {
    PrismaClientSqlite = require('@prisma/client').PrismaClient;
  } catch (e2) {}
}

export interface TaskInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  dueDate?: string;
}

export class ORMSQLitePrismaLab {
  private prisma: any;

  constructor(datasourceUrl?: string) {
    if (!PrismaClientSqlite) {
      throw new Error('SQLite Prisma Client not generated. Run "npm run prisma:gen"');
    }
    const url = datasourceUrl || config.sqlite.url;
    this.prisma = new PrismaClientSqlite({
      datasources: { db: { url } },
    });
  }

  public async init(): Promise<void> {
    await this.prisma.$connect();
  }

  public async create(data: TaskInput) {
    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        category: data.category || 'General',
        dueDate: data.dueDate || null,
      },
    });
  }

  public async createMany(tasks: TaskInput[]) {
    return this.prisma.task.createMany({
      data: tasks.map((t) => ({
        title: t.title,
        description: t.description || null,
        status: t.status || 'todo',
        priority: t.priority || 'medium',
        category: t.category || 'General',
        dueDate: t.dueDate || null,
      })),
    });
  }

  public async findMany(where?: { status?: string; priority?: string; category?: string }) {
    return this.prisma.task.findMany({
      where: {
        status: where?.status,
        priority: where?.priority,
        category: where?.category,
      },
      include: { subtasks: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findUnique(id: number) {
    return this.prisma.task.findUnique({
      where: { id },
      include: { subtasks: true },
    });
  }

  public async update(id: number, data: Partial<TaskInput>) {
    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  public async delete(id: number) {
    return this.prisma.task.delete({
      where: { id },
    });
  }

  public async close(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

if (process.argv[1] && process.argv[1].endsWith('orm_sqlite.ts')) {
  (async () => {
    console.log('[SQLite Prisma ORM] Testing SQLite Prisma Client...');
    const orm = new ORMSQLitePrismaLab();
    try {
      await orm.init();
      const created = await orm.create({
        title: 'Prisma SQLite Task Example',
        description: 'Testing SQLite specific Prisma Client',
        status: 'todo',
        priority: 'urgent',
        category: 'ORM Module',
      });
      console.log('[SQLite Prisma ORM] Created Task ID:', created.id);
    } catch (e: any) {
      console.error('[SQLite Prisma ORM] Note: Run "npm run prisma:gen && npm run prisma:push" first:', e.message);
    } finally {
      await orm.close();
    }
  })();
}