import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, PaymentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreatePaymentConceptDto } from './dto/create-payment-concept.dto.js';
import { UpdatePaymentRecordDto } from './dto/update-payment-record.dto.js';
import {
  AcademyPaymentSummaryDto,
  PaymentConceptDetailDto,
  PaymentConceptSummaryDto,
  PaymentRecordResponseDto,
} from './dto/payment-response.dto.js';

const recordWithPlayer = {
  player: {
    select: {
      id: true,
      fullName: true,
      team: { select: { name: true } },
    },
  },
} as const;

type RecordWithPlayer = Prisma.PaymentRecordGetPayload<{
  include: typeof recordWithPlayer;
}>;

function mapRecord(r: RecordWithPlayer): PaymentRecordResponseDto {
  return {
    id: r.id,
    conceptId: r.conceptId,
    playerId: r.playerId,
    player: {
      id: r.player.id,
      fullName: r.player.fullName,
      teamName: r.player.team?.name ?? null,
    },
    baseAmount: r.baseAmount,
    discountAmount: r.discountAmount,
    discountType: r.discountType,
    discountNotes: r.discountNotes,
    finalAmount: r.finalAmount,
    status: r.status,
    paidAt: r.paidAt,
    paymentMethod: r.paymentMethod,
    notes: r.notes,
    createdAt: r.createdAt,
  };
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createConcept(
    academyId: string,
    userId: string,
    dto: CreatePaymentConceptDto,
  ): Promise<{ concept: PaymentConceptSummaryDto; recordsCreated: number }> {
    if (dto.teamId) {
      const team = await this.prisma.team.findFirst({
        where: { id: dto.teamId, academyId, isActive: true },
      });
      if (!team) {
        throw new NotFoundException(
          'El equipo no existe o no pertenece a esta academia',
        );
      }
    }

    const amount = new Decimal(dto.amount);

    const concept = await this.prisma.paymentConcept.create({
      data: {
        academyId,
        teamId: dto.teamId ?? null,
        name: dto.name,
        amount,
        dueDate: new Date(dto.dueDate),
        createdById: userId,
      },
      include: {
        team: { select: { id: true, name: true } },
      },
    });

    const playerWhere: Prisma.PlayerWhereInput = {
      academyId,
      isActive: true,
      ...(dto.teamId ? { teamId: dto.teamId } : {}),
    };

    const players = await this.prisma.player.findMany({
      where: playerWhere,
      select: { id: true },
    });

    if (players.length > 0) {
      await this.prisma.paymentRecord.createMany({
        data: players.map((p) => ({
          conceptId: concept.id,
          playerId: p.id,
          baseAmount: amount,
          discountAmount: new Decimal(0),
          finalAmount: amount,
          status: PaymentStatus.pending,
        })),
      });
    }

    const summary = await this.buildConceptSummary(concept.id);

    return { concept: summary, recordsCreated: players.length };
  }

  async findAllConcepts(
    academyId: string,
    filters: { teamId?: string; search?: string },
  ): Promise<PaymentConceptSummaryDto[]> {
    const concepts = await this.prisma.paymentConcept.findMany({
      where: {
        academyId,
        ...(filters.teamId ? { teamId: filters.teamId } : {}),
        ...(filters.search
          ? { name: { contains: filters.search, mode: 'insensitive' } }
          : {}),
      },
      include: {
        team: { select: { id: true, name: true } },
        records: { select: { status: true } },
      },
      orderBy: { dueDate: 'desc' },
    });

    return concepts.map((c) => ({
      id: c.id,
      academyId: c.academyId,
      teamId: c.teamId,
      team: c.team ? { id: c.team.id, name: c.team.name } : null,
      name: c.name,
      amount: c.amount,
      dueDate: c.dueDate,
      totalPlayers: c.records.length,
      totalPaid: c.records.filter((r) => r.status === PaymentStatus.paid)
        .length,
      totalPending: c.records.filter((r) => r.status === PaymentStatus.pending)
        .length,
      totalOverdue: c.records.filter((r) => r.status === PaymentStatus.overdue)
        .length,
      createdAt: c.createdAt,
    }));
  }

  async findOneConcept(
    academyId: string,
    conceptId: string,
  ): Promise<PaymentConceptDetailDto> {
    const concept = await this.prisma.paymentConcept.findFirst({
      where: { id: conceptId, academyId },
      include: {
        team: { select: { id: true, name: true } },
        records: {
          include: recordWithPlayer,
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!concept) {
      throw new NotFoundException('Concepto de pago no encontrado');
    }

    return {
      id: concept.id,
      academyId: concept.academyId,
      teamId: concept.teamId,
      team: concept.team ? { id: concept.team.id, name: concept.team.name } : null,
      name: concept.name,
      amount: concept.amount,
      dueDate: concept.dueDate,
      totalPlayers: concept.records.length,
      totalPaid: concept.records.filter((r) => r.status === PaymentStatus.paid)
        .length,
      totalPending: concept.records.filter(
        (r) => r.status === PaymentStatus.pending,
      ).length,
      totalOverdue: concept.records.filter(
        (r) => r.status === PaymentStatus.overdue,
      ).length,
      createdAt: concept.createdAt,
      records: concept.records.map(mapRecord),
    };
  }

  async updateRecord(
    academyId: string,
    recordId: string,
    dto: UpdatePaymentRecordDto,
  ): Promise<PaymentRecordResponseDto> {
    const record = await this.prisma.paymentRecord.findFirst({
      where: {
        id: recordId,
        concept: { academyId },
      },
    });

    if (!record) {
      throw new NotFoundException('Registro de pago no encontrado');
    }

    if (dto.discountAmount !== undefined && dto.discountAmount > Number(record.baseAmount)) {
      throw new BadRequestException(
        'El descuento no puede superar el monto base',
      );
    }

    const newDiscountAmount =
      dto.discountAmount !== undefined
        ? new Decimal(dto.discountAmount)
        : record.discountAmount;

    const newFinalAmount = record.baseAmount.minus(newDiscountAmount);

    let newPaidAt: Date | null = record.paidAt;
    if (dto.status === PaymentStatus.paid && !record.paidAt && !dto.paidAt) {
      newPaidAt = new Date();
    } else if (dto.paidAt) {
      newPaidAt = new Date(dto.paidAt);
    } else if (
      dto.status !== undefined &&
      dto.status !== PaymentStatus.paid &&
      record.status === PaymentStatus.paid
    ) {
      newPaidAt = null;
    }

    const updated = await this.prisma.paymentRecord.update({
      where: { id: recordId },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.discountAmount !== undefined && {
          discountAmount: newDiscountAmount,
          finalAmount: newFinalAmount,
        }),
        ...(dto.discountType !== undefined && { discountType: dto.discountType }),
        ...(dto.discountNotes !== undefined && { discountNotes: dto.discountNotes }),
        ...(dto.paymentMethod !== undefined && { paymentMethod: dto.paymentMethod }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        paidAt: newPaidAt,
      },
      include: recordWithPlayer,
    });

    return mapRecord(updated);
  }

  async getAcademySummary(academyId: string): Promise<AcademyPaymentSummaryDto> {
    const [concepts, records] = await Promise.all([
      this.prisma.paymentConcept.count({ where: { academyId } }),
      this.prisma.paymentRecord.findMany({
        where: { concept: { academyId } },
        select: { status: true, finalAmount: true },
      }),
    ]);

    const totalAmountExpected = records.reduce(
      (sum, r) => sum.plus(r.finalAmount),
      new Decimal(0),
    );

    const paidRecords = records.filter((r) => r.status === PaymentStatus.paid);
    const totalAmountCollected = paidRecords.reduce(
      (sum, r) => sum.plus(r.finalAmount),
      new Decimal(0),
    );

    return {
      totalConcepts: concepts,
      totalRecords: records.length,
      totalPaid: paidRecords.length,
      totalPending: records.filter((r) => r.status === PaymentStatus.pending)
        .length,
      totalOverdue: records.filter((r) => r.status === PaymentStatus.overdue)
        .length,
      totalAmountExpected,
      totalAmountCollected,
      totalAmountPending: totalAmountExpected.minus(totalAmountCollected),
    };
  }

  async markOverdue(): Promise<number> {
    const now = new Date();
    const result = await this.prisma.paymentRecord.updateMany({
      where: {
        status: PaymentStatus.pending,
        concept: { dueDate: { lt: now } },
      },
      data: { status: PaymentStatus.overdue },
    });
    return result.count;
  }

  private async buildConceptSummary(
    conceptId: string,
  ): Promise<PaymentConceptSummaryDto> {
    const concept = await this.prisma.paymentConcept.findUniqueOrThrow({
      where: { id: conceptId },
      include: {
        team: { select: { id: true, name: true } },
        records: { select: { status: true } },
      },
    });

    return {
      id: concept.id,
      academyId: concept.academyId,
      teamId: concept.teamId,
      team: concept.team ? { id: concept.team.id, name: concept.team.name } : null,
      name: concept.name,
      amount: concept.amount,
      dueDate: concept.dueDate,
      totalPlayers: concept.records.length,
      totalPaid: concept.records.filter((r) => r.status === PaymentStatus.paid)
        .length,
      totalPending: concept.records.filter(
        (r) => r.status === PaymentStatus.pending,
      ).length,
      totalOverdue: concept.records.filter(
        (r) => r.status === PaymentStatus.overdue,
      ).length,
      createdAt: concept.createdAt,
    };
  }
}
