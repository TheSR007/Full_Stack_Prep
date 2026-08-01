import Redis from 'ioredis';
import { config } from '../config/config';

export class RedisFeaturesLab {
  private redisClient: Redis;
  private pubClient: Redis;
  private subClient: Redis;

  constructor(redisUrl?: string) {
    const url = redisUrl || config.redis.url;
    this.redisClient = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 });
    this.pubClient = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 });
    this.subClient = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 });
  }

  public async connect(): Promise<void> {
    try {
      await Promise.all([
        this.redisClient.connect(),
        this.pubClient.connect(),
        this.subClient.connect(),
      ]);
    } catch (e: any) {
      console.warn('[Redis Features] Server offline, feature calls will fallback gracefully:', e.message);
    }
  }

  public async isRateLimited(identifier: string, limit: number = 5, windowSeconds: number = 60): Promise<{ limited: boolean; remaining: number }> {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    try {
      const multi = this.redisClient.multi();
      multi.zremrangebyscore(key, 0, windowStart);
      multi.zadd(key, now, `${now}-${Math.random()}`);
      multi.zcard(key);
      multi.expire(key, windowSeconds);

      const results = await multi.exec();
      const requestCount = (results?.[2]?.[1] as number) || 1;

      return {
        limited: requestCount > limit,
        remaining: Math.max(0, limit - requestCount),
      };
    } catch (e) {
      return { limited: false, remaining: limit };
    }
  }

  public async storeRefreshToken(userId: string, token: string, ttlSeconds: number = 604800): Promise<void> {
    try {
      await this.redisClient.setex(`auth:refresh:${userId}:${token}`, ttlSeconds, 'active');
    } catch (e) {}
  }

  public async verifyRefreshToken(userId: string, token: string): Promise<boolean> {
    try {
      const exists = await this.redisClient.exists(`auth:refresh:${userId}:${token}`);
      return exists === 1;
    } catch (e) {
      return false;
    }
  }

  public async revokeRefreshToken(userId: string, token: string): Promise<void> {
    try {
      await this.redisClient.del(`auth:refresh:${userId}:${token}`);
    } catch (e) {}
  }

  public async publishTaskEvent(event: 'created' | 'updated' | 'deleted', taskData: any): Promise<number> {
    try {
      const payload = JSON.stringify({ event, taskData, timestamp: new Date().toISOString() });
      return await this.pubClient.publish('task_events', payload);
    } catch (e) {
      return 0;
    }
  }

  public async subscribeTaskEvents(onEvent: (eventData: any) => void): Promise<void> {
    try {
      await this.subClient.subscribe('task_events');
      this.subClient.on('message', (channel, message) => {
        if (channel === 'task_events') {
          onEvent(JSON.parse(message));
        }
      });
    } catch (e) {}
  }

  public async close(): Promise<void> {
    try {
      await this.redisClient.quit();
      await this.pubClient.quit();
      await this.subClient.quit();
    } catch (e) {}
  }
}

if (process.argv[1] && process.argv[1].endsWith('redis_features.ts')) {
  (async () => {
    console.log('[Redis Features] Testing Rate Limiter & Pub/Sub...');
    const features = new RedisFeaturesLab();
    await features.connect();

    for (let i = 1; i <= 6; i++) {
      const status = await features.isRateLimited('user-ip-127.0.0.1', 5, 60);
      console.log(`[Redis Features] Request #${i} status:`, status);
    }

    await features.close();
  })();
}