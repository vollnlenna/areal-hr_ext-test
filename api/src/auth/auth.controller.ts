import { Controller, Post, UseGuards, Req, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Req() req: Request) {
    return new Promise((resolve, reject) => {
      if (!req.user) {
        return reject(new Error('Пользователь не аутентифицирован'));
      }
      req.logIn(req.user, (err) => {
        if (err) {
          return reject(
            err instanceof Error
              ? err
              : new Error('Ошибка при входе в систему'),
          );
        }
        resolve(req.user);
      });
    });
  }

  @Post('logout')
  async logout(@Req() req: Request) {
    return new Promise((resolve, reject) => {
      req.logout((err) => {
        if (err) {
          return reject(
            err instanceof Error
              ? err
              : new Error('Ошибка при выходе из системы'),
          );
        }
        req.session.destroy((destroyErr) => {
          if (destroyErr) {
            return reject(
              destroyErr instanceof Error
                ? destroyErr
                : new Error('Ошибка при уничтожении сессии'),
            );
          }
          req.res?.clearCookie('connect.sid');
          resolve({ success: true });
        });
      });
    });
  }

  @Get('me')
  me(@Req() req: Request) {
    return req.user ?? null;
  }
}
