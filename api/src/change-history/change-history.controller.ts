import {
  Controller,
  Get,
  Param,
  InternalServerErrorException,
} from '@nestjs/common';
import { ChangeHistoryService, ChangeHistory } from './change-history.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@Controller('change-history')
@UseGuards(AuthGuard)
export class ChangeHistoryController {
  constructor(private readonly changeHistoryService: ChangeHistoryService) {}

  @Get()
  async getAll(): Promise<ChangeHistory[]> {
    try {
      return await this.changeHistoryService.getAll();
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при получении истории изменений',
      );
    }
  }

  @Get(':id')
  async getById(@Param('id') id: number): Promise<ChangeHistory | null> {
    try {
      return await this.changeHistoryService.getById(id);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при получении записи истории',
      );
    }
  }
}
