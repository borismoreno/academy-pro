import { Controller, Post, UseGuards } from '@nestjs/common';
import { Public } from '../../auth/decorators/public.decorator.js';
import { CronGuard } from '../../common/guards/cron.guard.js';
import { PaymentsService } from './payments.service.js';

@Controller('cron/payments')
export class PaymentsCronController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('mark-overdue')
  @Public()
  @UseGuards(CronGuard)
  async markOverdue(): Promise<{ message: string }> {
    await this.paymentsService.markOverdue();
    return { message: 'Registros marcados como vencidos exitosamente' };
  }
}
