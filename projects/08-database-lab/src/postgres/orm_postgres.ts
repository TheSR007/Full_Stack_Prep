import { PrismaClient } from '@prisma/client';
import { config } from '../config/config';

export interface PostgresTaskInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  dueDate?: string;
}

export class ORMPostgresPrismaLab {
  private prisma: PrismaClient;

  constructor(connectionString?: string) {
    const url = connectionString || config.postgres.url;
    this.prisma = new PrismaClient({
      datasources: { db: { url } },
    });
  }

  public async init(): Promise<void> {
    await this.prisma.$connect();
  }

  public async create(data: PostgresTaskInput) {
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

  public async createMany(tasks: PostgresTaskInput[]) {
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
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findUnique(id: number) {
    return this.prisma.task.findUnique({
      where: { id },
    });
  }

  public async update(id: number, data: Partial<PostgresTaskInput>) {
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

if (process.argv[1] && process.argv[1].endsWith('orm_postgres.ts')) {
  (async () => {
    console.log('[PostgreSQL Prisma ORM] Testing Prisma Client with PostgreSQL...');
    const orm = new ORMPostgresPrismaLab();
    try {
      await orm.init();
      const created = await orm.create({
        title: 'PostgreSQL Prisma ORM Test',
        description: 'Testing Prisma ORM data mapper with PostgreSQL',
        status: 'todo',
        priority: 'high',
        category: 'ORM',
      });
      console.log('[PostgreSQL Prisma ORM] Created Task ID:', created.id);

      const items = await orm.findMany({ status: 'todo' });
      console.log('[PostgreSQL Prisma ORM] Found items count:', items.length);
    } catch (e: any) {
      console.error('[PostgreSQL Prisma ORM] Note: Ensure database connection & Prisma schema are synced:', e.message);
    } finally {
      await orm.close();
    }
  })();
}