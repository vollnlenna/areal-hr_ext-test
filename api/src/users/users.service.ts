import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import * as argon2 from 'argon2';

export interface User {
  id_user: number;
  last_name: string;
  first_name: string;
  middle_name?: string | null;
  login: string;
  password_hash: string;
  id_role: number;
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

@Injectable()
export class UsersService {
  constructor(@Inject('PG_POOL') private readonly pgPool: Pool) {}

  async getAll(): Promise<User[]> {
    const result: QueryResult<User> = await this.pgPool.query(
      `select * from users where deleted_at is null`,
    );
    return result.rows;
  }

  async getDeleted(): Promise<User[]> {
    const result: QueryResult<User> = await this.pgPool.query(
      `select * from users where deleted_at is not null`,
    );
    return result.rows;
  }

  async getById(id: number): Promise<User | null> {
    const result: QueryResult<User> = await this.pgPool.query(
      `select * from users where id_user = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async getByLogin(login: string): Promise<User | null> {
    const result: QueryResult<User> = await this.pgPool.query<User>(
      `select * from users where login = $1 and deleted_at is null`,
      [login],
    );
    return result.rows[0] ?? null;
  }

  async create(data: {
    last_name: string;
    first_name: string;
    middle_name?: string | null;
    login: string;
    password_hash: string;
    id_role: number;
  }): Promise<User> {
    const hashed = await argon2.hash(data.password_hash);

    const result: QueryResult<User> = await this.pgPool.query(
      `insert into users (last_name, first_name, middle_name, login, password_hash, id_role, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6, now(), now())
         returning *`,
      [
        data.last_name,
        data.first_name,
        data.middle_name ?? null,
        data.login,
        hashed,
        data.id_role,
      ],
    );
    return result.rows[0];
  }

  async update(
    id: number,
    data: {
      last_name?: string;
      first_name?: string;
      middle_name?: string;
      login?: string;
      id_role?: number;
    },
  ): Promise<User | null> {
    const result: QueryResult<User> = await this.pgPool.query(
      `update users
       set last_name = coalesce($2, last_name),
           first_name = coalesce($3, first_name),
           middle_name = $4,
           login = coalesce($5, login),
           id_role = coalesce($6, id_role),
           updated_at = now()
       where id_user = $1
         returning *`,
      [
        id,
        data.last_name,
        data.first_name,
        data.middle_name ?? null,
        data.login,
        data.id_role,
      ],
    );

    return result.rows[0] ?? null;
  }

  async updatePassword(id: number, newPassword: string): Promise<boolean> {
    const hashed = await argon2.hash(newPassword);

    const result: QueryResult = await this.pgPool.query(
      `update users
       set password_hash = $2, updated_at = now()
       where id_user = $1`,
      [id, hashed],
    );

    return (result.rowCount ?? 0) > 0;
  }

  async delete(id: number): Promise<User | null> {
    const result: QueryResult<User> = await this.pgPool.query(
      `update users
       set deleted_at = now()
       where id_user = $1
         returning *`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async restore(id: number): Promise<User | null> {
    const result: QueryResult<User> = await this.pgPool.query(
      `update users
       set deleted_at = null
       where id_user = $1 and deleted_at is not null
         returning *`,
      [id],
    );
    return result.rows[0] ?? null;
  }
}
