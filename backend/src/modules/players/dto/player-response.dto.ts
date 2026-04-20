export class TeamInfoDto {
  id: string;
  name: string;
  category: string | null;
}

export class ParentUserDto {
  id: string;
  fullName: string;
  email: string;
}

export class PlayerParentResponseDto {
  id: string;
  playerId: string;
  userId: string;
  relationship: string | null;
  createdAt: Date;
  user: ParentUserDto;
}

export class PlayerResponseDto {
  id: string;
  academyId: string;
  teamId: string;
  fullName: string;
  birthDate: Date;
  position: string | null;
  photoUrl: string | null;
  height: number | null;
  weight: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  team: TeamInfoDto;
  parents?: PlayerParentResponseDto[];
}
