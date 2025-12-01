import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HrOperationsService, HrOperation } from './hr-operations.service';
import { validateHrOperation } from '../validation';

@Controller('hr-operations')
export class HrOperationsController {
  constructor(private readonly hrOperationsService: HrOperationsService) {}

  @Get()
  async getAll(): Promise<HrOperation[]> {
    try {
      return await this.hrOperationsService.getAll();
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при получении кадровых операций',
      );
    }
  }

  @Get('deleted')
  async getDeleted(): Promise<HrOperation[]> {
    try {
      return await this.hrOperationsService.getDeleted();
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при получении удаленных кадровых операций',
      );
    }
  }

  @Get(':id')
  async getById(@Param('id') id: number): Promise<HrOperation | null> {
    try {
      return await this.hrOperationsService.getById(id);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при получении кадровой операции',
      );
    }
  }

  @Post()
  async create(
    @Body()
    data: {
      id_employee: number;
      id_department: number;
      id_position: number;
      salary: number;
      is_active?: boolean;
    },
  ): Promise<HrOperation> {
    const { error } = validateHrOperation.validate(data);
    if (error) throw new BadRequestException(error.message);

    try {
      return await this.hrOperationsService.create(data);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при создании кадровой операции',
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body()
    data: {
      id_department?: number;
      id_position?: number;
      salary?: number;
      is_active?: boolean;
    },
  ): Promise<HrOperation | null> {
    const { error } = validateHrOperation.validate(data);
    if (error) throw new BadRequestException(error.message);

    try {
      return await this.hrOperationsService.update(id, data);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при обновлении кадровой операции',
      );
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<HrOperation | null> {
    try {
      return await this.hrOperationsService.delete(id);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при удалении кадровой операции',
      );
    }
  }

  @Patch('restore/:id')
  async restore(@Param('id') id: number): Promise<HrOperation | null> {
    try {
      return await this.hrOperationsService.restore(id);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при восстановлении кадровой операции',
      );
    }
  }
}
