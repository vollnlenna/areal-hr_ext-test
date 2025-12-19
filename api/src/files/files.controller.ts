import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  InternalServerErrorException,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService, File } from './files.service';
import { multerFilesConfig } from './multer-config';
import { validateFile } from '../validation';
import type { Response } from 'express';
import { join } from 'path';
import * as fs from 'fs';
import { AuthGuard } from '../auth/auth.guard';

@Controller('files')
@UseGuards(AuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerFilesConfig))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('file_name') fileName?: string,
  ): Promise<File> {
    const { error } = validateFile.validate({ file_name: fileName });
    if (error) throw new BadRequestException(error.message);

    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    try {
      return await this.filesService.saveUploadedFile(file, fileName!);
    } catch {
      throw new InternalServerErrorException('Ошибка при загрузке файла');
    }
  }

  @Get()
  async getAll(): Promise<File[]> {
    try {
      return await this.filesService.getAll();
    } catch {
      throw new InternalServerErrorException('Ошибка при получении файлов');
    }
  }

  @Get('storage/:path')
  getFile(@Param('path') path: string, @Res() res: Response): void {
    const root = process.env.STORAGE_DIR!;
    const fullPath = join(process.cwd(), root, path);

    if (!fs.existsSync(fullPath)) {
      throw new BadRequestException('Файл не найден');
    }

    try {
      res.sendFile(fullPath);
    } catch {
      throw new InternalServerErrorException('Ошибка при скачивании файла');
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
}
