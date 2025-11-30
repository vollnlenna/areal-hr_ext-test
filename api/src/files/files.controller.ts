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
import { FilesService, File } from './files.service';
import { validateFile } from '../validation';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  async getAll(): Promise<File[]> {
    try {
      return await this.filesService.getAll();
    } catch {
      throw new InternalServerErrorException('Ошибка при получении файлов');
    }
  }

  @Get(':id')
  async getById(@Param('id') id: number): Promise<File | null> {
    try {
      return await this.filesService.getById(id);
    } catch {
      throw new InternalServerErrorException('Ошибка при получении файла');
    }
  }

  @Post()
  async create(
    @Body()
    data: {
      file_name: string;
      file_path: string;
    },
  ): Promise<File> {
    const { error } = validateFile.validate(data);
    if (error) throw new BadRequestException(error.message);

    try {
      return await this.filesService.create(data);
    } catch {
      throw new InternalServerErrorException('Ошибка при создании файла');
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body()
    data: {
      file_name?: string;
      file_path?: string;
    },
  ): Promise<File | null> {
    const { error } = validateFile.validate(data);
    if (error) throw new BadRequestException(error.message);

    try {
      return await this.filesService.update(id, data);
    } catch {
      throw new InternalServerErrorException('Ошибка при обновлении файла');
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<File | null> {
    try {
      return await this.filesService.delete(id);
    } catch {
      throw new InternalServerErrorException('Ошибка при удалении файла');
    }
  }

  @Patch('restore/:id')
  async restore(@Param('id') id: number): Promise<File | null> {
    try {
      return await this.filesService.restore(id);
    } catch {
      throw new InternalServerErrorException('Ошибка при восстановлении файла');
    }
  }
}
