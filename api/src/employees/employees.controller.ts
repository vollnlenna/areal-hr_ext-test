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
import { EmployeesService, Employee } from './employees.service';
import { validateEmployee } from '../validation';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async getAll(): Promise<Employee[]> {
    try {
      return await this.employeesService.getAll();
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при получении сотрудников',
      );
    }
  }

  @Get(':id')
  async getById(@Param('id') id: number): Promise<Employee | null> {
    try {
      return await this.employeesService.getById(id);
    } catch {
      throw new InternalServerErrorException('Ошибка при получении сотрудника');
    }
  }

  @Post()
  async create(
    @Body()
    data: {
      last_name: string;
      first_name: string;
      middle_name?: string;
      birth_date: string;
      passport_data: string;
      registration_address: string;
    },
  ): Promise<Employee> {
    const { error } = validateEmployee.validate(data);
    if (error) throw new BadRequestException(error.message);

    try {
      return await this.employeesService.create(data);
    } catch {
      throw new InternalServerErrorException('Ошибка при создании сотрудника');
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body()
    data: {
      last_name?: string;
      first_name?: string;
      middle_name?: string;
      birth_date?: string;
      passport_data?: string;
      registration_address?: string;
    },
  ): Promise<Employee | null> {
    const { error } = validateEmployee.validate(data);
    if (error) throw new BadRequestException(error.message);

    try {
      return await this.employeesService.update(id, data);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при обновлении сотрудника',
      );
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<Employee | null> {
    try {
      return await this.employeesService.delete(id);
    } catch {
      throw new InternalServerErrorException('Ошибка при удалении сотрудника');
    }
  }

  @Patch('restore/:id')
  async restore(@Param('id') id: number): Promise<Employee | null> {
    try {
      return await this.employeesService.restore(id);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при восстановлении сотрудника',
      );
    }
  }
}
