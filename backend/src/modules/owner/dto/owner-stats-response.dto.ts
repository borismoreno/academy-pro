export class AcademiesByPlanDto {
  free: number;
  pro: number;
  enterprise: number;
}

export class OwnerStatsResponseDto {
  totalAcademies: number;
  activeAcademies: number;
  totalPlayers: number;
  totalUsers: number;
  academiesByPlan: AcademiesByPlanDto;
  newAcademiesThisMonth: number;
  estimatedMRR: number;
}
