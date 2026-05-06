import { DiscountType, PaymentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class PaymentTeamInfoDto {
  id: string;
  name: string;
}

export class PaymentPlayerInfoDto {
  id: string;
  fullName: string;
  teamName: string | null;
}

export class PaymentConceptSummaryDto {
  id: string;
  academyId: string;
  teamId: string | null;
  team: PaymentTeamInfoDto | null;
  name: string;
  amount: Decimal;
  dueDate: Date;
  totalPlayers: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  createdAt: Date;
}

export class PaymentRecordResponseDto {
  id: string;
  conceptId: string;
  playerId: string;
  player: PaymentPlayerInfoDto;
  baseAmount: Decimal;
  discountAmount: Decimal;
  discountType: DiscountType | null;
  discountNotes: string | null;
  finalAmount: Decimal;
  status: PaymentStatus;
  paidAt: Date | null;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: Date;
}

export class PaymentConceptDetailDto extends PaymentConceptSummaryDto {
  records: PaymentRecordResponseDto[];
}

export class PlayerPaymentConceptInfoDto {
  id: string;
  name: string;
  dueDate: Date;
}

export class PlayerPaymentRecordDto {
  id: string;
  conceptId: string;
  concept: PlayerPaymentConceptInfoDto;
  baseAmount: Decimal;
  discountAmount: Decimal;
  discountType: DiscountType | null;
  finalAmount: Decimal;
  status: PaymentStatus;
  paidAt: Date | null;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: Date;
}

export class AcademyPaymentSummaryDto {
  totalConcepts: number;
  totalRecords: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalAmountExpected: Decimal;
  totalAmountCollected: Decimal;
  totalAmountPending: Decimal;
}
