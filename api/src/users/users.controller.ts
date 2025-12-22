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
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService, User } from './users.service';
import { validateUser, validatePassword } from '../validation';
import { AuthGuard } from '../auth/auth.guard';
import type { Request } from 'express';

@UseGuards(AuthGuard)
@Controller('users')
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

  private checkAdmin(req: Request) {
    const user = req.user as User | undefined;
    if (!user || user.id_role !== 1) {
      throw new ForbiddenException('Доступ только для администратора');
    }
  }

  @Post()
  async create(
    @Req() req: Request,
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
    this.checkAdmin(req);
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
    @Req() req: Request,
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
    this.checkAdmin(req);
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
    @Req() req: Request,
    @Param('id') id: number,
    @Body() body: { password: string },
  ): Promise<{ success: boolean }> {
    this.checkAdmin(req);
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
  async delete(
    @Req() req: Request,
    @Param('id') id: number,
  ): Promise<User | null> {
    this.checkAdmin(req);
    try {
      return await this.usersService.delete(id);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при удалении пользователя',
      );
    }
  }

  @Patch('restore/:id')
  async restore(
    @Req() req: Request,
    @Param('id') id: number,
  ): Promise<User | null> {
    this.checkAdmin(req);
    try {
      return await this.usersService.restore(id);
    } catch {
      throw new InternalServerErrorException(
        'Ошибка при восстановлении пользователя',
      );
    }
  }
}
