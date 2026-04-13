import { IsNotEmpty, IsString } from 'class-validator';

export class PresignedUrlRequestDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  contentType!: string;
}
