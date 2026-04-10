import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateMetricDto {
  @IsString()
  @MinLength(2)
  metricName: string;

  @IsInt()
  @Min(0)
  sortOrder: number;
}
