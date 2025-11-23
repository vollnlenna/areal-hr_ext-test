import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { DepartmentsService, Department } from './departments.service';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  async getAll(): Promise<Department[]> {
    return this.departmentsService.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: number): Promise<Department | null> {
    return this.departmentsService.getById(id);
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
    return this.departmentsService.create(data);
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
    return this.departmentsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<Department | null> {
    return this.departmentsService.delete(id);
  }
}
