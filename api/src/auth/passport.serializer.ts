import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService, User } from '../users/users.service';
import type { DoneCallback } from 'passport';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: DoneCallback): void {
    done(null, user.id_user);
  }

  async deserializeUser(id: number, done: DoneCallback): Promise<void> {
    try {
      const user = await this.usersService.getById(id);
      if (!user) {
        return done(new Error('Пользователь не найден'), null);
      }
      done(null, user);
    } catch {
      done(new Error('Ошибка при восстановлении сессии пользователя'), null);
    }
  }
}
