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
import { PositionsService, Position } from './positions.service';
import { validatePosition } from '../validation';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  async getAll(): Promise<Position[]> {
    try {
      return await this.positionsService.getAll();
    } catch {
      throw new InternalServerErrorException('Ошибка при получении должностей');
    }
  }

  @Get(':id')
  async getById(@Param('id') id: number): Promise<Position | null> {
    try {
      return await this.positionsService.getById(id);
    } catch {
      throw new InternalServerErrorException('Ошибка при получении должности');
    }
  }

  @Post()
  async create(@Body() data: { name: string }): Promise<Position> {
    const { error } = validatePosition.validate(data);
    if (error) throw new BadRequestException(error.message);

    try {
      return await this.positionsService.create(data);
    } catch {
      throw new InternalServerErrorException('Ошибка при создании должности');
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body()
    data: { name?: string },
  ): Promise<Position | null> {
    const { error } = validatePosition.validate(data);
    if (error) throw new BadRequestException(error.message);

    try {
      return await this.positionsService.update(id, data);
    } catch {
      throw new InternalServerErrorException('Ошибка при обновлении должности');
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<Position | null> {
    try {
      return await this.positionsService.delete(id);
    } catch {
      throw new InternalServerErrorException('Ошибка при удалении должности');
    }
  }
}
