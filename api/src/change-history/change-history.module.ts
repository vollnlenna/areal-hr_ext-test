import { Module } from '@nestjs/common';
import { ChangeHistoryController } from './change-history.controller';
import { ChangeHistoryService } from './change-history.service';

@Module({
  controllers: [ChangeHistoryController],
  providers: [ChangeHistoryService],
})
export class ChangeHistoryModule {}
