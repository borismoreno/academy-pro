import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsUUID, ValidateNested } from 'class-validator';

export class AttendanceRecordItemDto {
  @IsUUID()
  playerId: string;

  @IsBoolean()
  present: boolean;
}

export class RecordAttendanceDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordItemDto)
  records: AttendanceRecordItemDto[];
}
