import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

export class AcademySubscriptionResponseDto {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startsAt: Date;
  endsAt: Date | null;
  createdAt: Date;
}

export class AcademyResponseDto {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  subscription?: AcademySubscriptionResponseDto | null;
}
