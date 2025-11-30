import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  InternalServerErrorException,
} from '@nestjs/common';
import { ChangeHistoryService, ChangeHistory } from './change-history.service';

@Controller('change-history')
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

  @Post()
  async create(
    @Body()
    data: {
      id_user: number;
      id_organization?: number;
      id_department?: number;
      id_position?: number;
      id_employee?: number;
      id_hr_operation?: number;
      field_name?: string;
      old_value?: string;
      new_value?: string;
    },
  ): Promise<ChangeHistory> {
    try {
      return await this.changeHistoryService.create(data);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при создании записи истории',
      );
    }
  }
}
