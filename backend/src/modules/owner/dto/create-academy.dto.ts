import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateAcademyDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  city: string;

  @IsEmail()
  directorEmail: string;

  @IsString()
  @MinLength(2)
  directorName: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
