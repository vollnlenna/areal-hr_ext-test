import {
  Controller,
  Get,
  Param,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService, User } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAll(): Promise<User[]> {
    try {
      return await this.usersService.getAll();
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при получении списка пользователей',
      );
    }
  }

  @Get(':id')
  async getById(@Param('id') id: number): Promise<User | null> {
    try {
      return await this.usersService.getById(id);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при получении пользователя',
      );
    }
  }
}
