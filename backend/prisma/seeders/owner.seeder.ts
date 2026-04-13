import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import * as bcrypt from 'bcrypt';

// Requires DATABASE_URL to be set in the environment (.env file or explicit variable).
// Usage: npm run seed:owner

const OWNER_EMAIL = 'boris@cancha360.com';
const OWNER_FULL_NAME = 'Boris Owner';
const OWNER_PASSWORD = 'ChangeMe123!';
const BCRYPT_ROUNDS = 10;

async function main(): Promise<void> {
  const connectionString = process.env['DATABASE_URL'];
  if (!connectionString) {
    throw new Error('DATABASE_URL no está configurado');
  }
  const adapter = new PrismaNeon({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const existing = await prisma.user.findUnique({
      where: { email: OWNER_EMAIL },
    });

    if (existing) {
      console.log('Owner ya existe');
      return;
    }

    const passwordHash = await bcrypt.hash(OWNER_PASSWORD, BCRYPT_ROUNDS);

    await prisma.$transaction(async (tx) => {
      const owner = await tx.user.create({
        data: {
          fullName: OWNER_FULL_NAME,
          email: OWNER_EMAIL,
          passwordHash,
          isActive: true,
          emailVerifiedAt: new Date(),
        },
      });

      await tx.userAcademyRole.create({
        data: {
          userId: owner.id,
          academyId: null,
          role: Role.saas_owner,
          isActive: true,
        },
      });
    });

    console.log(
      `Owner creado correctamente. Email: ${OWNER_EMAIL} / Password: ${OWNER_PASSWORD}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  console.error('Seeder falló:', err);
  process.exit(1);
});
