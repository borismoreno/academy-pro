import { IsUUID } from 'class-validator';

export class SelectAcademyDto {
  @IsUUID()
  academyId: string;
}
