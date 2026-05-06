export type DiscountType = "siblings" | "scholarship" | "other";
export type PaymentStatus = "pending" | "paid" | "overdue";

export interface PaymentTeamInfo {
  id: string;
  name: string;
}

export interface PaymentPlayerInfo {
  id: string;
  fullName: string;
  teamName: string | null;
}

export interface PaymentConcept {
  id: string;
  academyId: string;
  name: string;
  amount: number;
  dueDate: string;
  teamId: string | null;
  team: PaymentTeamInfo | null;
  totalPlayers: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  conceptId: string;
  playerId: string;
  player: PaymentPlayerInfo;
  baseAmount: number;
  discountAmount: number;
  discountType: DiscountType | null;
  discountNotes: string | null;
  finalAmount: number;
  status: PaymentStatus;
  paidAt: string | null;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
}

export interface PaymentConceptDetail extends PaymentConcept {
  records: PaymentRecord[];
}

export interface PaymentSummary {
  totalConcepts: number;
  totalRecords: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalAmountExpected: number;
  totalAmountCollected: number;
  totalAmountPending: number;
}

export interface CreatePaymentConceptData {
  name: string;
  amount: number;
  dueDate: string;
  teamId?: string;
}

export interface UpdatePaymentRecordData {
  status?: PaymentStatus;
  discountAmount?: number;
  discountType?: DiscountType;
  discountNotes?: string;
  paymentMethod?: string;
  notes?: string;
  paidAt?: string;
}
