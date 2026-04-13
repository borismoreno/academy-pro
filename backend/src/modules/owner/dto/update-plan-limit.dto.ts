import { IsInt, Min } from 'class-validator';

export class UpdatePlanLimitDto {
  @IsInt()
  @Min(-1)
  maxCount: number;
}
