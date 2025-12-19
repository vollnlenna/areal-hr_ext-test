import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService, User } from '../users/users.service';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(
    login: string,
    password: string,
  ): Promise<Omit<User, 'password_hash'>> {
    const user = await this.usersService.getByLogin(login);
    if (!user) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }
    const isValid = await argon2.verify(user.password_hash, password);
    if (!isValid) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }
    const { password_hash, ...result } = user;
    void password_hash;
    return result;
  }
}
