import { prisma } from '../lib/prisma';
import { getShortCode } from '../utils/shortCodeGenerator';
import { isUrlReachable } from '../utils/urlReachability';
import { analyticsService } from './analytics.service';
import { getCachedUrl, setCachedUrl, delCachedUrl } from '../lib/redis';

export class UrlService {
  private getBaseUrl(): string {
    return process.env.BASE_URL || 'http://localhost:3000';
  }

  private constructShortUrl(shortCode: string): string {
    return `${this.getBaseUrl()}/url/${shortCode}`;
  }

  async createShortUrl(
    originalUrl: string,
    shortCode?: string,
    userId?: string,
  ) {
    const isReachable = await isUrlReachable(originalUrl);
    if (!isReachable) {
      throw new Error('URL is not accessible or does not exist');
    }

    const existingUrl = await prisma.url.findFirst({
      where: { originalUrl },
    });

    if (existingUrl) {
      if (!shortCode) {
        return {
          id: existingUrl.id,
          originalUrl: existingUrl.originalUrl,
          shortCode: existingUrl.shortCode,
          shortUrl: this.constructShortUrl(existingUrl.shortCode),
          clicks: existingUrl.clicks,
          createdAt: existingUrl.createdAt,
        };
      }
    }

    const finalShortCode = await getShortCode(shortCode);

    const url = await prisma.url.create({
      data: {
        originalUrl,
        shortCode: finalShortCode,
        userId,
      },
    });

    return {
      ...url,
      shortUrl: this.constructShortUrl(url.shortCode),
    };
  }

  async getUrlByShortCode(shortCode: string) {
    const url = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!url) {
      throw new Error('Short URL not found');
    }

    await prisma.url.update({
      where: { id: url.id },
      data: { clicks: { increment: 1 } },
    });

    return url;
  }

  async getUrlByShortCodeWithTracking(
    shortCode: string,
    metadata: { referrer?: string; userAgent?: string; ip?: string },
  ) {
    const cached = await getCachedUrl(shortCode);
    if (cached) {
      analyticsService.recordClick(cached.id, metadata).catch(() => {});
      return cached;
    }

    const url = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!url) {
      throw new Error('Short URL not found');
    }

    await prisma.url.update({
      where: { id: url.id },
      data: { clicks: { increment: 1 } },
    });

    await analyticsService.recordClick(url.id, metadata);

    setCachedUrl(url).catch(() => {});

    return url;
  }

  async getUserUrls(userId: string, cursor?: string, limit: number = 20) {
    const urls = await prisma.url.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    const hasMore = urls.length > limit;
    const items = hasMore ? urls.slice(0, limit) : urls;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      urls: items.map((url: any) => ({
        ...url,
        shortUrl: this.constructShortUrl(url.shortCode),
      })),
      nextCursor,
      hasMore,
    };
  }

  async updateUrl(
    id: string,
    userId: string,
    data: { originalUrl?: string; shortCode?: string },
  ) {
    const url = await prisma.url.findUnique({ where: { id } });

    if (!url) {
      throw new Error('URL not found');
    }

    if (url.userId !== userId) {
      throw new Error('Unauthorized to update this URL');
    }

    const codeChanged = data.shortCode && data.shortCode !== url.shortCode;

    if (codeChanged) {
      const existing = await prisma.url.findUnique({
        where: { shortCode: data.shortCode },
      });
      if (existing) {
        throw new Error('Short code is already taken');
      }
    }

    const updated = await prisma.url.update({
      where: { id },
      data: {
        ...(data.originalUrl ? { originalUrl: data.originalUrl } : {}),
        ...(data.shortCode ? { shortCode: data.shortCode } : {}),
      },
    });

    delCachedUrl(url.shortCode).catch(() => {});
    if (codeChanged) {
      delCachedUrl(updated.shortCode).catch(() => {});
    }

    return {
      ...updated,
      shortUrl: this.constructShortUrl(updated.shortCode),
    };
  }

  async deleteUrl(id: string, userId: string) {
    const url = await prisma.url.findUnique({
      where: { id },
    });

    if (!url) {
      throw new Error('URL not found');
    }

    if (url.userId !== userId) {
      throw new Error('Unauthorized to delete this URL');
    }

    await prisma.url.delete({
      where: { id },
    });

    delCachedUrl(url.shortCode).catch(() => {});

    return { message: 'URL deleted successfully' };
  }
}

export const urlService = new UrlService();
