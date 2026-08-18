// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { DEFAULT_MERCHANTS } from '../src/constants/merchants';

const prisma = new PrismaClient();

async function main() {
  for (const merchant of DEFAULT_MERCHANTS) {
    await prisma.merchant.upsert({
      where: { slug: merchant.slug },
      update: merchant,
      create: merchant,
    });
  }
  console.log(`✅ Seeded ${DEFAULT_MERCHANTS.length} default merchants.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
