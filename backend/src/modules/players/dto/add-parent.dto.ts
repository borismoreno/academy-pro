import { IsString, IsUUID, MinLength } from 'class-validator';

export class AddParentDto {
  @IsUUID()
  userId: string;

  @IsString()
  @MinLength(1)
  relationship: string;
}
