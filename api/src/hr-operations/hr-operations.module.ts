import { Module } from '@nestjs/common';
import { HrOperationsController } from './hr-operations.controller';
import { HrOperationsService } from './hr-operations.service';

@Module({
  controllers: [HrOperationsController],
  providers: [HrOperationsService],
})
export class HrOperationsModule {}
