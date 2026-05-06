import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

export async function verifyParentAccess(
  prisma: PrismaService,
  playerId: string,
  requestingUserId: string,
): Promise<void> {
  const link = await prisma.playerParent.findFirst({
    where: { playerId, userId: requestingUserId },
  });
  if (!link) {
    throw new ForbiddenException(
      'No tienes permiso para ver la información de este jugador',
    );
  }
}
