import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

export interface User {
  id_user: number;
  last_name: string;
  first_name: string;
  middle_name?: string | null;
  login: string;
  id_role: number;
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

@Injectable()
export class UsersService {
  constructor(@Inject('PG_POOL') private readonly pg: Pool) {}

  async getAll(): Promise<User[]> {
    const res: QueryResult<User> = await this.pg.query(
      `select * from users where deleted_at is null`,
    );
    return res.rows;
  }
  async getById(id: number): Promise<User | null> {
    const res: QueryResult<User> = await this.pg.query(
      `select * from users where id_user = $1`,
      [id],
    );
    return res.rows[0] ?? null;
  }
}
