import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { validateOrganization } from '../validation';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  async getAll() {
    return this.organizationsService.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: number) {
    return this.organizationsService.getById(id);
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

    return this.organizationsService.create(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body()
    data: { name?: string; comment?: string | null },
  ) {
    const { error } = validateOrganization.validate(data);
    if (error) throw new BadRequestException(error.message);

    return this.organizationsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.organizationsService.delete(id);
  }
}
