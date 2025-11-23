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
import { PositionsService, Position } from './positions.service';
import { validatePosition } from '../validation';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  async getAll(): Promise<Position[]> {
    return this.positionsService.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: number): Promise<Position | null> {
    return this.positionsService.getById(id);
  }

  @Post()
  async create(@Body() data: { name: string }): Promise<Position> {
    const { error } = validatePosition.validate(data);
    if (error) throw new BadRequestException(error.message);

    return this.positionsService.create(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body()
    data: { name?: string },
  ): Promise<Position | null> {
    const { error } = validatePosition.validate(data);
    if (error) throw new BadRequestException(error.message);

    return this.positionsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<Position | null> {
    return this.positionsService.delete(id);
  }
}
