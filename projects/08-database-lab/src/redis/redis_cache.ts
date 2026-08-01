import Redis from 'ioredis';
import { config } from '../config/config';

export class RedisCacheLab {
  private redis: Redis;

  constructor(redisUrl?: string) {
    const url = redisUrl || config.redis.url;
    this.redis = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
  }

  public async connect(): Promise<void> {
    try {
      await this.redis.connect();
    } catch (e: any) {
      console.warn('[Redis Cache] Could not connect to Redis server, fallback active:', e.message);
    }
  }

  public async getOrSetCache<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number = 300): Promise<{ data: T; source: 'cache' | 'db' }> {
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        return { data: JSON.parse(cached) as T, source: 'cache' };
      }
    } catch (e) {}

    const data = await fetchFn();

    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(data));
    } catch (e) {}

    return { data, source: 'db' };
  }

  public async setCachePipelined(items: { key: string; value: any; ttlSeconds?: number }[]): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();
      for (const item of items) {
        pipeline.setex(item.key, item.ttlSeconds || 300, JSON.stringify(item.value));
      }
      await pipeline.exec();
    } catch (e) {}
  }

  public async getCachePipelined(keys: string[]): Promise<number> {
    try {
      const pipeline = this.redis.pipeline();
      for (const key of keys) {
        pipeline.get(key);
      }
      const results = await pipeline.exec();
      let hits = 0;
      if (results) {
        for (const [err, res] of results) {
          if (!err && res !== null) hits++;
        }
      }
      return hits;
    } catch (e) {
      return 0;
    }
  }

  public async invalidateTaskCache(taskId: number | string): Promise<void> {
    try {
      const keys = await this.redis.keys(`task:${taskId}*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      await this.redis.del('tasks:all', 'tasks:analytics');
    } catch (e) {}
  }

  public async setTaskHash(taskId: string, taskObj: Record<string, any>, ttlSeconds: number = 600): Promise<void> {
    try {
      const flat: Record<string, string> = {};
      for (const [k, v] of Object.entries(taskObj)) {
        flat[k] = typeof v === 'object' ? JSON.stringify(v) : String(v);
      }
      await this.redis.hmset(`task:hash:${taskId}`, flat);
      await this.redis.expire(`task:hash:${taskId}`, ttlSeconds);
    } catch (e) {}
  }

  public async getTaskHash(taskId: string): Promise<Record<string, any> | null> {
    try {
      const res = await this.redis.hgetall(`task:hash:${taskId}`);
      if (Object.keys(res).length === 0) return null;
      return res;
    } catch (e) {
      return null;
    }
  }

  public async close(): Promise<void> {
    try {
      await this.redis.quit();
    } catch (e) {}
  }
}

if (process.argv[1] && process.argv[1].endsWith('redis_cache.ts')) {
  (async () => {
    console.log('[Redis Cache] Testing Cache-Aside Pattern...');
    const cache = new RedisCacheLab();
    await cache.connect();

    let callCount = 0;
    const dbQuery = async () => {
      callCount++;
      return { id: 101, title: 'Cached Task', status: 'in_progress', fetchedAt: new Date().toISOString() };
    };

    const res1 = await cache.getOrSetCache('task:101', dbQuery, 60);
    console.log('[Redis Cache] First Retrieval:', res1);

    const res2 = await cache.getOrSetCache('task:101', dbQuery, 60);
    console.log('[Redis Cache] Second Retrieval:', res2);

    console.log(`[Redis Cache] DB Query Function Executed Count: ${callCount}`);
    await cache.close();
  })();
}