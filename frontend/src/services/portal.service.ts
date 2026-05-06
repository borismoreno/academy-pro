import api from "./api";
import type { ApiResponse } from "@/types";
import type {
  PlayerResponse,
  AttendanceSummary,
  EvaluationProgress,
  NextSession,
} from "./players.service";
import type { PortalPaymentRecord } from "@/types/payment.types";
import type { PortalMatchEntry } from "@/types/match.types";
import type { PlayerSeasonSummary } from "@/types/match.types";

export type {
  PlayerResponse,
  AttendanceSummary,
  EvaluationProgress,
  NextSession,
  PortalPaymentRecord,
  PortalMatchEntry,
  PlayerSeasonSummary,
};

/**
 * Returns all players linked to the authenticated parent via player_parents.
 * Backend enforces the parent filter — only children linked to this user are returned.
 */
export async function getMyPlayers(): Promise<PlayerResponse[]> {
  const response = await api.get<ApiResponse<PlayerResponse[]>>("/players");
  return response.data.data;
}

export async function getPlayerById(id: string): Promise<PlayerResponse> {
  const response = await api.get<ApiResponse<PlayerResponse>>(`/players/${id}`);
  return response.data.data;
}

export async function getAttendanceSummary(
  playerId: string,
): Promise<AttendanceSummary> {
  const response = await api.get<ApiResponse<AttendanceSummary>>(
    `/attendance/players/${playerId}/summary`,
  );
  return response.data.data;
}

export async function getNextSession(
  playerId: string,
): Promise<NextSession | null> {
  const response = await api.get<ApiResponse<NextSession | null>>(
    `/players/${playerId}/next-session`,
  );
  return response.data.data;
}

export async function getEvaluationProgress(
  playerId: string,
): Promise<EvaluationProgress> {
  const response = await api.get<ApiResponse<EvaluationProgress>>(
    `/evaluations/players/${playerId}/progress`,
  );
  return response.data.data;
}

export async function getPlayerPaymentRecords(
  academyId: string,
  playerId: string,
): Promise<PortalPaymentRecord[]> {
  const response = await api.get<ApiResponse<PortalPaymentRecord[]>>(
    `/academies/${academyId}/payments/players/${playerId}/records`,
  );
  return response.data.data;
}

export async function getPlayerMatchHistory(
  academyId: string,
  playerId: string,
): Promise<PortalMatchEntry[]> {
  const response = await api.get<ApiResponse<PortalMatchEntry[]>>(
    `/academies/${academyId}/matches/players/${playerId}/history`,
  );
  return response.data.data;
}

export async function getPlayerSeasonStats(
  academyId: string,
  playerId: string,
): Promise<PlayerSeasonSummary> {
  const response = await api.get<ApiResponse<PlayerSeasonSummary>>(
    `/academies/${academyId}/matches/players/${playerId}/season-stats`,
  );
  return response.data.data;
}
