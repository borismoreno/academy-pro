import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { PaymentsCronController } from './payments-cron.controller.js';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';

@Module({
  imports: [NotificationsModule],
  controllers: [PaymentsController, PaymentsCronController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
