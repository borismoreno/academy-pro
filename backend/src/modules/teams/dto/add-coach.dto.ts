import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class AddCoachDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
