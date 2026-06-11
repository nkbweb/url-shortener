import { prisma } from '../lib/prisma';
import { getShortCode } from '../utils/shortCodeGenerator';
import { isUrlReachable } from '../utils/urlReachability';

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
    // Check if URL is reachable
    const isReachable = await isUrlReachable(originalUrl);
    if (!isReachable) {
      throw new Error('URL is not accessible or does not exist');
    }

    // Check if URL already exists (for duplicate handling)
    const existingUrl = await prisma.url.findFirst({
      where: { originalUrl },
    });

    if (existingUrl) {
      // If no short code provided, return the existing one
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
      // If short code provided but different from existing, continue to create new
    }

    // Get or generate short code
    const finalShortCode = await getShortCode(shortCode);

    // Create the URL
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

    // Increment click count
    await prisma.url.update({
      where: { id: url.id },
      data: { clicks: { increment: 1 } },
    });

    return url;
  }

  async getUserUrls(userId: string) {
    const urls = await prisma.url.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return urls.map((url: any) => ({
      ...url,
      shortUrl: this.constructShortUrl(url.shortCode),
    }));
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

    return { message: 'URL deleted successfully' };
  }
}

export const urlService = new UrlService();
