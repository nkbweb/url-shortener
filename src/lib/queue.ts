import { Queue, Worker } from 'bullmq';
import { prisma } from './prisma';
import { analyticsService } from '../services/analytics.service';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

export const clickQueue = new Queue('click-tracking', { connection });

const worker = new Worker(
  'click-tracking',
  async (job) => {
    const { urlId, metadata } = job.data;

    console.log(`\n═══════════════════════════════════════`);
    console.log(`[BullMQ] 🟢 Worker picked up job ${job.id}`);
    console.log(`[BullMQ]    URL ID:   ${urlId}`);
    console.log(`[BullMQ]    Referrer: ${metadata.referrer || 'direct'}`);
    console.log(`[BullMQ]    Job was delayed by ${job.delay}ms`);
    console.log(`[BullMQ]    Timestamp: ${new Date().toLocaleTimeString()}`);

    // 1. Increment clicks in DB
    console.log(`[BullMQ]    ➜ Incrementing clicks...`);
    await prisma.url.update({
      where: { id: urlId },
      data: { clicks: { increment: 1 } },
    });
    console.log(`[BullMQ]    ✓ Clicks incremented`);

    // 2. Record analytics
    console.log(`[BullMQ]    ➜ Recording analytics...`);
    await analyticsService.recordClick(urlId, metadata);
    console.log(`[BullMQ]    ✓ Analytics recorded`);

    console.log(`[BullMQ] ✅ Job ${job.id} complete`);
    console.log(`═══════════════════════════════════════\n`);
  },
  { connection },
);

worker.on('completed', (job) => {
  console.log(`[BullMQ] 🏁 Job ${job.id} emitted "completed"`);
});

worker.on('failed', (job, err) => {
  console.error(`[BullMQ] ❌ Job ${job?.id} failed:`, err.message);
});

worker.on('drained', () => {
  console.log(`[BullMQ] 💤 Queue drained — no more jobs waiting`);
});
