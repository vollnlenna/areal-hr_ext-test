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
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { OrganizationsService } from './organizations.service';
import { validateOrganization } from '../validation';
import { AuthGuard } from '../auth/auth.guard';

@Controller('organizations')
@UseGuards(AuthGuard)
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

  @Get('deleted')
  async getDeleted() {
    try {
      return await this.organizationsService.getDeleted();
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при получении удаленных организаций',
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
    @Body() data: { name: string; comment?: string | null },
    @Req() req: Request,
  ) {
    const user = req.user as { id_user: number };
    const { error } = validateOrganization.validate(data);
    if (error) {
      throw new BadRequestException(error.message);
    }

    try {
      return await this.organizationsService.create(data, user.id_user);
    } catch {
      throw new InternalServerErrorException('Ошибка при создании организации');
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() data: { name?: string; comment?: string | null },
    @Req() req: Request,
  ) {
    const user = req.user as { id_user: number };
    const { error } = validateOrganization.validate(data);
    if (error) {
      throw new BadRequestException(error.message);
    }

    try {
      return await this.organizationsService.update(id, data, user.id_user);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при обновлении организации',
      );
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Req() req: Request) {
    const user = req.user as { id_user: number };
    try {
      return await this.organizationsService.delete(id, user.id_user);
    } catch {
      throw new InternalServerErrorException('Ошибка при удалении организации');
    }
  }

  @Patch('restore/:id')
  async restore(@Param('id') id: number, @Req() req: Request) {
    const user = req.user as { id_user: number };
    try {
      return await this.organizationsService.restore(id, user.id_user);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при восстановлении организации',
      );
    }
  }
}
