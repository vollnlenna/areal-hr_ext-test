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
import { OrganizationsService } from './organizations.service';
import { validateOrganization } from '../validation';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  async getAll() {
    try {
      return await this.organizationsService.getAll();
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при получении организаций',
      );
    }
  }

  @Get(':id')
  async getById(@Param('id') id: number) {
    try {
      return await this.organizationsService.getById(id);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при получении организации',
      );
    }
  }

  @Post()
  async create(
    @Body()
    data: {
      name: string;
      comment?: string | null;
    },
  ) {
    const { error } = validateOrganization.validate(data);
    if (error) throw new BadRequestException(error.message);

    try {
      return await this.organizationsService.create(data);
    } catch {
      throw new InternalServerErrorException('Ошибка при создании организации');
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body()
    data: { name?: string; comment?: string | null },
  ) {
    const { error } = validateOrganization.validate(data);
    if (error) throw new BadRequestException(error.message);

    try {
      return await this.organizationsService.update(id, data);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при обновлении организации',
      );
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    try {
      return await this.organizationsService.delete(id);
    } catch {
      throw new InternalServerErrorException('Ошибка при удалении организации');
    }
  }
}
