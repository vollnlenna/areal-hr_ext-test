import { Module } from '@nestjs/common';
import { PassportScansController } from './passport-scans.controller';
import { PassportScansService } from './passport-scans.service';

@Module({
  controllers: [PassportScansController],
  providers: [PassportScansService],
})
export class PassportScansModule {}
