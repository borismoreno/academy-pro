import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { SelectAcademyDto } from './dto/select-academy.dto.js';
import { ResendVerificationDto } from './dto/resend-verification.dto.js';
import { Public } from './decorators/public.decorator.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { LocalGuard } from './guards/local.guard.js';
import { JwtGuard } from './guards/jwt.guard.js';
import type { JwtPayload } from './strategies/jwt.strategy.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    const { message } = await this.authService.register(dto);
    return { message };
  }

  @Public()
  @UseGuards(LocalGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@CurrentUser() user: User) {
    const data = await this.authService.login(user);
    return { data, message: 'Inicio de sesión exitoso' };
  }

  @Public()
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string) {
    const { message } = await this.authService.verifyEmail(token);
    return { message };
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() dto: ResendVerificationDto) {
    const { message } = await this.authService.resendVerification(dto.email);
    return { message };
  }

  @UseGuards(JwtGuard)
  @Post('select-academy')
  @HttpCode(HttpStatus.OK)
  async selectAcademy(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SelectAcademyDto,
  ) {
    const data = await this.authService.selectAcademy(user, dto);
    return { data, message: 'Academia seleccionada exitosamente' };
  }

  @UseGuards(JwtGuard)
  @Post('switch-academy')
  @HttpCode(HttpStatus.OK)
  async switchAcademy(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SelectAcademyDto,
  ) {
    const data = await this.authService.selectAcademy(user, dto);
    return { data, message: 'Academia cambiada exitosamente' };
  }
}
