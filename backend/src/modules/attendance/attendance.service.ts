import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateSessionDto } from './dto/create-session.dto.js';
import { RecordAttendanceDto } from './dto/record-attendance.dto.js';
import {
  PlayerAttendanceSummaryDto,
  SessionListResponseDto,
  SessionResponseDto,
} from './dto/session-response.dto.js';
import { UpdateSessionDto } from './dto/update-session.dto.js';

const sessionInclude = {
  team: { select: { id: true, name: true } },
  records: {
    include: {
      player: {
        select: { id: true, fullName: true, position: true, teamId: true },
      },
    },
  },
} as const;

type SessionWithDetails = Prisma.AttendanceSessionGetPayload<{
  include: typeof sessionInclude;
}>;

function mapSession(session: SessionWithDetails): SessionResponseDto {
  const totalPresent = session.records.filter((r) => r.present).length;
  const totalAbsent = session.records.filter((r) => !r.present).length;
  return {
    id: session.id,
    teamId: session.teamId,
    coachId: session.coachId,
    sessionDate: session.sessionDate,
    notes: session.notes,
    createdAt: session.createdAt,
    team: session.team,
    records: session.records.map((r) => ({
      id: r.id,
      sessionId: r.sessionId,
      playerId: r.playerId,
      present: r.present,
      createdAt: r.createdAt,
      player: r.player,
    })),
    totalPresent,
    totalAbsent,
  };
}

function mapSessionList(session: SessionWithDetails): SessionListResponseDto {
  const totalPresent = session.records.filter((r) => r.present).length;
  const totalAbsent = session.records.filter((r) => !r.present).length;
  return {
    id: session.id,
    teamId: session.teamId,
    coachId: session.coachId,
    sessionDate: session.sessionDate,
    notes: session.notes,
    createdAt: session.createdAt,
    team: session.team,
    totalPresent,
    totalAbsent,
  };
}

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  private parseDateRange(dateStr: string): { gte: Date; lt: Date } {
    const d = new Date(dateStr);
    const gte = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const lt = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1),
    );
    return { gte, lt };
  }

  private parseMonthRange(month: string): { gte: Date; lt: Date } {
    const [year, monthNum] = month.split('-').map(Number);
    const gte = new Date(Date.UTC(year, monthNum - 1, 1));
    const lt = new Date(Date.UTC(year, monthNum, 1));
    return { gte, lt };
  }

  async createSession(
    academyId: string,
    userId: string,
    role: Role,
    dto: CreateSessionDto,
  ): Promise<SessionResponseDto> {
    const team = await this.prisma.team.findFirst({
      where: { id: dto.teamId, academyId, isActive: true },
    });
    if (!team) {
      throw new NotFoundException('El equipo no existe o no pertenece a esta academia');
    }

    if (role === Role.coach) {
      const assigned = await this.prisma.teamCoach.findFirst({
        where: { teamId: dto.teamId, userId },
      });
      if (!assigned) {
        throw new ForbiddenException('No tienes acceso a este equipo');
      }
    }

    const duplicate = await this.prisma.attendanceSession.findFirst({
      where: { teamId: dto.teamId, sessionDate: this.parseDateRange(dto.sessionDate) },
    });
    if (duplicate) {
      throw new ConflictException(
        'Ya existe una sesión registrada para este equipo en esa fecha',
      );
    }

    const players = await this.prisma.player.findMany({
      where: { teamId: dto.teamId, isActive: true },
      select: { id: true },
    });

    const sessionDate = new Date(dto.sessionDate);

    const session = await this.prisma.$transaction(async (tx) => {
      const created = await tx.attendanceSession.create({
        data: {
          teamId: dto.teamId,
          coachId: userId,
          sessionDate,
          notes: dto.notes,
        },
      });

      if (players.length > 0) {
        await tx.attendanceRecord.createMany({
          data: players.map((p) => ({
            sessionId: created.id,
            playerId: p.id,
            present: false,
          })),
        });
      }

      return tx.attendanceSession.findUniqueOrThrow({
        where: { id: created.id },
        include: sessionInclude,
      });
    });

    return mapSession(session);
  }

  async findAllSessions(
    academyId: string,
    userId: string,
    role: Role,
    teamId?: string,
    month?: string,
  ): Promise<SessionListResponseDto[]> {
    const where: Prisma.AttendanceSessionWhereInput = {
      team: {
        academyId,
        ...(role === Role.coach && {
          coaches: { some: { userId } },
        }),
      },
      ...(teamId && { teamId }),
      ...(month && { sessionDate: this.parseMonthRange(month) }),
    };

    const sessions = await this.prisma.attendanceSession.findMany({
      where,
      include: sessionInclude,
      orderBy: { sessionDate: 'desc' },
    });

    return sessions.map(mapSessionList);
  }

  async findOneSession(
    academyId: string,
    userId: string,
    role: Role,
    id: string,
  ): Promise<SessionResponseDto> {
    const session = await this.prisma.attendanceSession.findFirst({
      where: { id, team: { academyId } },
      include: sessionInclude,
    });
    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    if (role === Role.coach) {
      const assigned = await this.prisma.teamCoach.findFirst({
        where: { teamId: session.teamId, userId },
      });
      if (!assigned) {
        throw new ForbiddenException('No tienes acceso a este equipo');
      }
    }

    if (role === Role.parent) {
      const parentLinks = await this.prisma.playerParent.findMany({
        where: { userId },
        select: { playerId: true },
      });
      const linkedPlayerIds = new Set(parentLinks.map((pl) => pl.playerId));
      const filteredRecords = session.records.filter((r) =>
        linkedPlayerIds.has(r.playerId),
      );
      if (filteredRecords.length === 0) {
        throw new ForbiddenException('No tienes acceso a esta sesión');
      }
      return mapSession({ ...session, records: filteredRecords });
    }

    return mapSession(session);
  }

  async updateSession(
    academyId: string,
    userId: string,
    role: Role,
    id: string,
    dto: UpdateSessionDto,
  ): Promise<SessionResponseDto> {
    const session = await this.prisma.attendanceSession.findFirst({
      where: { id, team: { academyId } },
    });
    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    if (role === Role.coach) {
      const assigned = await this.prisma.teamCoach.findFirst({
        where: { teamId: session.teamId, userId },
      });
      if (!assigned) {
        throw new ForbiddenException('No tienes acceso a este equipo');
      }
    }

    const updated = await this.prisma.attendanceSession.update({
      where: { id },
      data: { notes: dto.notes },
      include: sessionInclude,
    });

    return mapSession(updated);
  }

  async deleteSession(academyId: string, id: string): Promise<void> {
    const session = await this.prisma.attendanceSession.findFirst({
      where: { id, team: { academyId } },
    });
    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    await this.prisma.$transaction([
      this.prisma.attendanceRecord.deleteMany({ where: { sessionId: id } }),
      this.prisma.attendanceSession.delete({ where: { id } }),
    ]);
  }

  async bulkUpdateRecords(
    academyId: string,
    userId: string,
    role: Role,
    sessionId: string,
    dto: RecordAttendanceDto,
  ): Promise<SessionResponseDto> {
    const session = await this.prisma.attendanceSession.findFirst({
      where: { id: sessionId, team: { academyId } },
      include: { records: { select: { playerId: true } } },
    });
    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    if (role === Role.coach) {
      const assigned = await this.prisma.teamCoach.findFirst({
        where: { teamId: session.teamId, userId },
      });
      if (!assigned) {
        throw new ForbiddenException('No tienes acceso a este equipo');
      }
    }

    const sessionPlayerIds = new Set(session.records.map((r) => r.playerId));
    for (const item of dto.records) {
      if (!sessionPlayerIds.has(item.playerId)) {
        throw new NotFoundException(
          `Registro de asistencia no encontrado para el jugador ${item.playerId}`,
        );
      }
    }

    await this.prisma.$transaction(
      dto.records.map((item) =>
        this.prisma.attendanceRecord.updateMany({
          where: { sessionId, playerId: item.playerId },
          data: { present: item.present },
        }),
      ),
    );

    const updated = await this.prisma.attendanceSession.findUniqueOrThrow({
      where: { id: sessionId },
      include: sessionInclude,
    });

    return mapSession(updated);
  }

  async getPlayerSummary(
    academyId: string,
    userId: string,
    role: Role,
    playerId: string,
    month?: string,
  ): Promise<PlayerAttendanceSummaryDto> {
    const player = await this.prisma.player.findFirst({
      where: { id: playerId, academyId },
    });
    if (!player) {
      throw new NotFoundException('Jugador no encontrado');
    }

    if (role === Role.coach) {
      const assigned = await this.prisma.teamCoach.findFirst({
        where: { teamId: player.teamId, userId },
      });
      if (!assigned) {
        throw new ForbiddenException('No tienes acceso a este equipo');
      }
    }

    if (role === Role.parent) {
      const linked = await this.prisma.playerParent.findFirst({
        where: { playerId, userId },
      });
      if (!linked) {
        throw new ForbiddenException('No tienes acceso a este jugador');
      }
    }

    const recordsWhere: Prisma.AttendanceRecordWhereInput = {
      playerId,
      ...(month && {
        session: { sessionDate: this.parseMonthRange(month) },
      }),
    };

    const records = await this.prisma.attendanceRecord.findMany({
      where: recordsWhere,
      include: {
        session: { select: { id: true, sessionDate: true } },
      },
      orderBy: { session: { sessionDate: 'desc' } },
    });

    const totalSessions = records.length;
    const totalPresent = records.filter((r) => r.present).length;
    const totalAbsent = records.filter((r) => !r.present).length;
    const attendancePercentage =
      totalSessions === 0
        ? 0
        : Math.round((totalPresent / totalSessions) * 1000) / 10;

    return {
      playerId,
      totalSessions,
      totalPresent,
      totalAbsent,
      attendancePercentage,
      sessions: records.map((r) => ({
        sessionId: r.session.id,
        sessionDate: r.session.sessionDate,
        present: r.present,
      })),
    };
  }
}
