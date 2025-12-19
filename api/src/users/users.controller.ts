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
  UseGuards,
} from '@nestjs/common';
import { UsersService, User } from './users.service';
import { validateUser, validatePassword } from '../validation';
import { AuthGuard } from '../auth/auth.guard';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAll(): Promise<User[]> {
    try {
      return await this.usersService.getAll();
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при получении пользователей',
      );
    }
  }

  @Get('deleted')
  async getDeleted(): Promise<User[]> {
    try {
      return await this.usersService.getDeleted();
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при получении удалённых пользователей',
      );
    }
  }

  @Get('roles')
  async getRoles(): Promise<{ id: number; name: string }[]> {
    try {
      await Promise.resolve();
      return [
        { id: 1, name: 'Администратор' },
        { id: 2, name: 'Менеджер по персоналу' },
      ];
    } catch {
      throw new InternalServerErrorException('Ошибка при получении ролей');
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

  @Post()
  async create(
    @Body()
    data: {
      last_name: string;
      first_name: string;
      middle_name?: string;
      login: string;
      password: string;
      id_role: number;
    },
  ): Promise<User> {
    const { password, ...userData } = data;
    const userValidation = validateUser.validate(userData);
    if (userValidation.error)
      throw new BadRequestException(userValidation.error.message);
    const passValidation = validatePassword.validate({ password });
    if (passValidation.error)
      throw new BadRequestException(passValidation.error.message);

    try {
      return await this.usersService.create({
        ...userData,
        password_hash: password,
      });
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при создании пользователя',
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body()
    data: {
      last_name?: string;
      first_name?: string;
      middle_name?: string;
      login?: string;
      id_role?: number;
    },
  ): Promise<User | null> {
    const { error } = validateUser.validate(data);
    if (error) throw new BadRequestException(error.message);

    try {
      return await this.usersService.update(id, data);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при обновлении пользователя',
      );
    }
  }

  @Patch(':id/password')
  async updatePassword(
    @Param('id') id: number,
    @Body() body: { password: string },
  ): Promise<{ success: boolean }> {
    const { error } = validatePassword.validate(body);
    if (error) throw new BadRequestException(error.message);

    try {
      const success = await this.usersService.updatePassword(id, body.password);
      return { success };
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при обновлении пароля пользователя',
      );
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<User | null> {
    try {
      return await this.usersService.delete(id);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при удалении пользователя',
      );
    }
  }

  @Patch('restore/:id')
  async restore(@Param('id') id: number): Promise<User | null> {
    try {
      return await this.usersService.restore(id);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при восстановлении пользователя',
      );
    }
  }
}
