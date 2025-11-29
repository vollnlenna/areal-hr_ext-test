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
import { DepartmentsService, Department } from './departments.service';
import { validateDepartment } from '../validation';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  async getAll(): Promise<Department[]> {
    try {
      return await this.departmentsService.getAll();
    } catch {
      throw new InternalServerErrorException('Ошибка при получении отделов');
    }
  }

  @Get(':id')
  async getById(@Param('id') id: number): Promise<Department | null> {
    try {
      return await this.departmentsService.getById(id);
    } catch {
      throw new InternalServerErrorException('Ошибка при получении отдела');
    }
  }

  @Post()
  async create(
    @Body()
    data: {
      name: string;
      id_organization: number;
      id_parent_department?: number | null;
      comment?: string | null;
    },
  ): Promise<Department> {
    const { error } = validateDepartment.validate(data);
    if (error) throw new BadRequestException(error.message);

    try {
      return await this.departmentsService.create(data);
    } catch {
      throw new InternalServerErrorException('Ошибка при создании отдела');
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body()
    data: {
      name?: string;
      id_organization?: number;
      id_parent_department?: number | null;
      comment?: string | null;
    },
  ): Promise<Department | null> {
    const { error } = validateDepartment.validate(data);
    if (error) throw new BadRequestException(error.message);

    try {
      return await this.departmentsService.update(id, data);
    } catch {
      throw new InternalServerErrorException('Ошибка при обновлении отдела');
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<Department | null> {
    try {
      return await this.departmentsService.delete(id);
    } catch {
      throw new InternalServerErrorException('Ошибка при удалении отдела');
    }
  }

  @Patch('restore/:id')
  async restore(@Param('id') id: number): Promise<Department | null> {
    try {
      return await this.departmentsService.restore(id);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при восстановлении отдела',
      );
    }
  }
}
