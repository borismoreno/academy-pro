import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import type { JwtPayload } from '../../auth/strategies/jwt.strategy.js';
import { CreatePaymentConceptDto } from './dto/create-payment-concept.dto.js';
import { UpdatePaymentRecordDto } from './dto/update-payment-record.dto.js';
import {
  AcademyPaymentSummaryDto,
  PaymentConceptDetailDto,
  PaymentConceptSummaryDto,
  PaymentRecordResponseDto,
} from './dto/payment-response.dto.js';
import { PaymentsService } from './payments.service.js';

@Controller('academies/:academyId/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('concepts')
  @Roles(Role.academy_director)
  async createConcept(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePaymentConceptDto,
  ): Promise<{
    data: { concept: PaymentConceptSummaryDto; recordsCreated: number };
    message: string;
  }> {
    const data = await this.paymentsService.createConcept(
      user.academyId as string,
      user.sub,
      dto,
    );
    return {
      data,
      message: `Concepto creado exitosamente. Se generaron ${data.recordsCreated} registros de pago.`,
    };
  }

  @Get('concepts')
  @Roles(Role.academy_director)
  async findAllConcepts(
    @CurrentUser() user: JwtPayload,
    @Query('teamId') teamId?: string,
    @Query('search') search?: string,
  ): Promise<{ data: PaymentConceptSummaryDto[]; message: string }> {
    const data = await this.paymentsService.findAllConcepts(
      user.academyId as string,
      { teamId, search },
    );
    return { data, message: 'Conceptos de pago obtenidos exitosamente' };
  }

  @Get('concepts/:conceptId')
  @Roles(Role.academy_director)
  async findOneConcept(
    @CurrentUser() user: JwtPayload,
    @Param('conceptId') conceptId: string,
  ): Promise<{ data: PaymentConceptDetailDto; message: string }> {
    const data = await this.paymentsService.findOneConcept(
      user.academyId as string,
      conceptId,
    );
    return { data, message: 'Concepto de pago obtenido exitosamente' };
  }

  @Patch('records/:recordId')
  @Roles(Role.academy_director)
  async updateRecord(
    @CurrentUser() user: JwtPayload,
    @Param('recordId') recordId: string,
    @Body() dto: UpdatePaymentRecordDto,
  ): Promise<{ data: PaymentRecordResponseDto; message: string }> {
    const data = await this.paymentsService.updateRecord(
      user.academyId as string,
      recordId,
      dto,
    );
    return { data, message: 'Registro de pago actualizado exitosamente' };
  }

  @Get('summary')
  @Roles(Role.academy_director)
  async getSummary(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ data: AcademyPaymentSummaryDto; message: string }> {
    const data = await this.paymentsService.getAcademySummary(
      user.academyId as string,
    );
    return { data, message: 'Resumen de pagos obtenido exitosamente' };
  }
}
