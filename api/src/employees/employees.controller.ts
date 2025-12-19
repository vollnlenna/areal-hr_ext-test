import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EmployeesService, Employee } from './employees.service';
import { validateEmployee } from '../validation';
import { Req } from '@nestjs/common';
import type { Request } from 'express';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@Controller('employees')
@UseGuards(AuthGuard)
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

  @Get('deleted')
  async getDeleted(): Promise<Employee[]> {
    try {
      return await this.employeesService.getDeleted();
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при получении удаленных сотрудников',
      );
    }
  }

  @Get('search')
  async searchEmployees(
    @Query('q') query = '',
    @Query('limit') limit = '5',
    @Query('offset') offset = '0',
  ) {
    try {
      return await this.employeesService.search(
        query ?? '',
        Number(limit),
        Number(offset),
      );
    } catch {
      throw new InternalServerErrorException('Ошибка при поиске сотрудников');
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
    @Req() req: Request,
  ): Promise<Employee> {
    const user = req.user as { id_user: number };
    const { error } = validateEmployee.validate(data);
    if (error) throw new BadRequestException(error.message);

    try {
      return await this.employeesService.create(data, user.id_user);
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
    @Req() req: Request,
  ): Promise<Employee | null> {
    const user = req.user as { id_user: number };
    const { error } = validateEmployee.validate(data);
    if (error) throw new BadRequestException(error.message);

    try {
      return await this.employeesService.update(id, data, user.id_user);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при обновлении сотрудника',
      );
    }
  }

  @Delete(':id')
  async delete(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<Employee | null> {
    const user = req.user as { id_user: number };
    try {
      return await this.employeesService.delete(id, user.id_user);
    } catch {
      throw new InternalServerErrorException('Ошибка при удалении сотрудника');
    }
  }

  @Patch('restore/:id')
  async restore(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<Employee | null> {
    const user = req.user as { id_user: number };
    try {
      return await this.employeesService.restore(id, user.id_user);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при восстановлении сотрудника',
      );
    }
  }
}
