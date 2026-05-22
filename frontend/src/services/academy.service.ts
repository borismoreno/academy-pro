import type { ApiResponse } from "@/types";
import api from "./api";

export interface AcademyMember {
  userId: string;
  fullName: string;
  email: string;
  isActive: boolean;
  role: string;
}

export async function fetchCoaches(): Promise<AcademyMember[]> {
  const response = await api.get<ApiResponse<AcademyMember[]>>(
    "/academies/members?role=coach",
  );
  return response.data.data;
}
