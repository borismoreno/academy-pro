import api from "./api";
import type { ApiResponse } from "@/types";
import type {
  PaymentConcept,
  PaymentConceptDetail,
  PaymentSummary,
  PaymentRecord,
  CreatePaymentConceptData,
  UpdatePaymentRecordData,
} from "@/types/payment.types";

const base = (academyId: string) => `/academies/${academyId}/payments`;

export async function getConcepts(
  academyId: string,
  filters?: { teamId?: string; search?: string },
): Promise<PaymentConcept[]> {
  const params = new URLSearchParams();
  if (filters?.teamId) params.set("teamId", filters.teamId);
  if (filters?.search) params.set("search", filters.search);
  const query = params.toString();
  const url = query
    ? `${base(academyId)}/concepts?${query}`
    : `${base(academyId)}/concepts`;
  const res = await api.get<ApiResponse<PaymentConcept[]>>(url);
  return res.data.data;
}

export async function getConceptById(
  academyId: string,
  conceptId: string,
): Promise<PaymentConceptDetail> {
  const res = await api.get<ApiResponse<PaymentConceptDetail>>(
    `${base(academyId)}/concepts/${conceptId}`,
  );
  return res.data.data;
}

export async function createConcept(
  academyId: string,
  data: CreatePaymentConceptData,
): Promise<{ concept: PaymentConcept; recordsCreated: number }> {
  const res = await api.post<
    ApiResponse<{ concept: PaymentConcept; recordsCreated: number }>
  >(`${base(academyId)}/concepts`, data);
  return res.data.data;
}

export async function updateRecord(
  academyId: string,
  recordId: string,
  data: UpdatePaymentRecordData,
): Promise<PaymentRecord> {
  const res = await api.patch<ApiResponse<PaymentRecord>>(
    `${base(academyId)}/records/${recordId}`,
    data,
  );
  return res.data.data;
}

export async function getPaymentSummary(
  academyId: string,
): Promise<PaymentSummary> {
  const res = await api.get<ApiResponse<PaymentSummary>>(
    `${base(academyId)}/summary`,
  );
  return res.data.data;
}
