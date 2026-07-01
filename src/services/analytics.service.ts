import { prisma } from '../lib/prisma';

export class AnalyticsService {
  async recordClick(
    urlId: string,
    metadata: { referrer?: string; userAgent?: string; ip?: string },
  ) {
    await prisma.click.create({
      data: {
        urlId,
        referrer: metadata.referrer || null,
        userAgent: metadata.userAgent || null,
        ip: metadata.ip || null,
      },
    });
  }

  async getClicksByUrlId(urlId: string) {
    const clicks = await prisma.click.findMany({
      where: { urlId },
      orderBy: { timestamp: 'desc' },
      take: 500,
    });

    const total = clicks.length;
    const referrers = this.groupBy(
      clicks.filter((c) => c.referrer),
      (c) => c.referrer!,
    );
    const browsers = this.groupBy(
      clicks.filter((c) => c.userAgent),
      (c) => this.simplifyUserAgent(c.userAgent!),
    );
    const last7Days = clicks.filter(
      (c) => c.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    ).length;
    const clicksByDay = this.groupByDate(
      clicks.filter(
        (c) => c.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      ),
    );

    return {
      total,
      last7Days,
      clicksByDay,
      referrers: Object.entries(referrers)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count),
      browsers: Object.entries(browsers)
        .map(([browser, count]) => ({ browser, count }))
        .sort((a, b) => b.count - a.count),
    };
  }

  private groupBy<T>(items: T[], keyFn: (item: T) => string) {
    return items.reduce(
      (acc, item) => {
        const key = keyFn(item);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  private groupByDate(clicks: { timestamp: Date }[]) {
    const map: Record<string, number> = {};
    for (const click of clicks) {
      const date = click.timestamp.toISOString().split('T')[0];
      map[date] = (map[date] || 0) + 1;
    }
    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private simplifyUserAgent(ua: string): string {
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('MSIE') || ua.includes('Trident'))
      return 'Internet Explorer';
    return 'Other';
  }
}

export const analyticsService = new AnalyticsService();
