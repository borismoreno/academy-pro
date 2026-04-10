import { PrismaClient } from '@prisma/client';

// Requires DATABASE_URL to be set in the environment before running.
// Usage: DATABASE_URL="..." npm run seed:metrics

const DEFAULT_METRICS = [
  { metricName: 'Técnica', sortOrder: 1, isActive: true },
  { metricName: 'Física', sortOrder: 2, isActive: true },
  { metricName: 'Táctica', sortOrder: 3, isActive: true },
  { metricName: 'Actitud', sortOrder: 4, isActive: true },
];

async function main(): Promise<void> {
  const prisma = new PrismaClient();

  try {
    const academies = await prisma.academy.findMany({ select: { id: true } });
    console.log(`Found ${academies.length} academy/academies.`);

    for (const academy of academies) {
      const existingCount = await prisma.evaluationMetric.count({
        where: { academyId: academy.id },
      });

      if (existingCount > 0) {
        console.log(`Academy ${academy.id} already has metrics — skipping.`);
        continue;
      }

      await prisma.evaluationMetric.createMany({
        data: DEFAULT_METRICS.map((m) => ({
          academyId: academy.id,
          metricName: m.metricName,
          sortOrder: m.sortOrder,
          isActive: m.isActive,
        })),
      });

      console.log(`Seeded default metrics for academy ${academy.id}.`);
    }

    console.log('Seeding complete.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  console.error('Seeder failed:', err);
  process.exit(1);
});
