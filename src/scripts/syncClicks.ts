import { prisma } from '../lib/prisma';

async function main() {
  console.log('🔄 Starting click count synchronization...');

  const urls = await prisma.url.findMany({
    include: {
      _count: {
        select: { clicksData: true }
      }
    }
  });

  let updatedCount = 0;

  for (const url of urls) {
    const actualClicks = url._count.clicksData;
    if (url.clicks !== actualClicks) {
      console.log(`🔗 URL /${url.shortCode} (ID: ${url.id}): DB clicks = ${url.clicks}, Actual Click records = ${actualClicks}. Updating...`);
      await prisma.url.update({
        where: { id: url.id },
        data: { clicks: actualClicks }
      });
      updatedCount++;
    }
  }

  console.log(`✅ Synchronization complete. Updated ${updatedCount} URLs.`);
}

main()
  .catch((e) => {
    console.error('❌ Error running click sync script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
