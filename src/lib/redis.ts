import Redis from 'ioredis';
import type { Url } from '@prisma/client';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  ...(process.env.REDIS_TLS === 'true' ? { tls: {} } : {}),
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 100, 2000);
  },
  maxRetriesPerRequest: 1,
});

redis.on('error', () => {});

export async function getCachedUrl(shortCode: string): Promise<Url | null> {
  try {
    const cached = await redis.get(`url:${shortCode}`);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

export async function setCachedUrl(url: Url): Promise<void> {
  try {
    await redis.set(`url:${url.shortCode}`, JSON.stringify(url), 'EX', 86400);
  } catch {}
}

export async function delCachedUrl(shortCode: string): Promise<void> {
  try {
    await redis.del(`url:${shortCode}`);
  } catch {}
}

export default redis;
