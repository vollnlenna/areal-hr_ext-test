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

  @Get('deleted')
  async getDeleted(): Promise<Position[]> {
    try {
      return await this.positionsService.getDeleted();
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при получении удаленных должностей',
      );
    }
  }

  @Get('search')
  async searchPositions(
    @Query('q') query = '',
    @Query('limit') limit = '5',
    @Query('offset') offset = '0',
  ) {
    try {
      return await this.positionsService.search(
        query ?? '',
        Number(limit),
        Number(offset),
      );
    } catch {
      throw new InternalServerErrorException('Ошибка при поиске должностей');
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

  @Patch('restore/:id')
  async restore(@Param('id') id: number) {
    try {
      return await this.positionsService.restore(id);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при восстановлении должности',
      );
    }
  }
}
