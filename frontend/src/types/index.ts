export type UserRole =
  | 'saas_owner'
  | 'academy_director'
  | 'coach'
  | 'parent';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface Academy {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
}

export interface Team {
  id: string;
  academyId: string;
  name: string;
  category: string;
  schedule: string;
  field: string;
  isActive: boolean;
}

export interface Player {
  id: string;
  academyId: string;
  teamId: string;
  fullName: string;
  birthDate: string;
  position: string;
  photoUrl: string | null;
  isActive: boolean;
}

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface Field {
  id: string;
  academyId: string;
  name: string;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
