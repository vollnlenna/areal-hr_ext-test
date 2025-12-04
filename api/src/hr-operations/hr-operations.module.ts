import { Module } from '@nestjs/common';
import { HrOperationsController } from './hr-operations.controller';
import { HrOperationsService } from './hr-operations.service';
import { ChangeHistoryModule } from '../change-history/change-history.module';

@Module({
  imports: [ChangeHistoryModule],
  controllers: [HrOperationsController],
  providers: [HrOperationsService],
  exports: [HrOperationsService],
})
export class HrOperationsModule {}
