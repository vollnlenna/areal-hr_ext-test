import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { PositionsService, Position } from './positions.service';

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
  async create(
    @Body()
    data: {
      name: string;
    },
  ): Promise<Position> {
    return this.positionsService.create(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body()
    data: { name?: string },
  ): Promise<Position | null> {
    return this.positionsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<Position | null> {
    return this.positionsService.delete(id);
  }
}
