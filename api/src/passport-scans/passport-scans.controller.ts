import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { PassportScansService, PassportScan } from './passport-scans.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('passport-scans')
@UseGuards(AuthGuard)
export class PassportScansController {
  constructor(private readonly passportScansService: PassportScansService) {}

  @Get('employee/:employeeId')
  async getByEmployee(
    @Param('employeeId') employeeId: number,
  ): Promise<PassportScan[]> {
    try {
      return await this.passportScansService.getByEmployee(employeeId);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при получении сканов паспорта',
      );
    }
  }

  @Post()
  async create(
    @Body()
    data: {
      id_employee: number;
      id_file: number;
    },
  ): Promise<PassportScan> {
    try {
      return await this.passportScansService.create(data);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при привязке скана к сотруднику',
      );
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<PassportScan | null> {
    try {
      return await this.passportScansService.delete(id);
    } catch {
      throw new InternalServerErrorException('Ошибка при удалении связи скана');
    }
  }
}
