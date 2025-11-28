import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

export interface Position {
  id_position: number;
  name: string;
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

@Injectable()
export class PositionsService {
  constructor(@Inject('PG_POOL') private readonly pgPool: Pool) {}

  async getAll(): Promise<Position[]> {
    const result: QueryResult<Position> = await this.pgPool.query(
      `select * from positions where deleted_at is null`,
    );
    return result.rows;
  }

  async getById(id: number): Promise<Position | null> {
    const result: QueryResult<Position> = await this.pgPool.query(
      `select * from positions where id_position = $1 and deleted_at is null`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async create(data: { name: string }): Promise<Position> {
    const result: QueryResult<Position> = await this.pgPool.query(
      `insert into positions (name, created_at, updated_at)
       values ($1, now(), now()) returning *`,
      [data.name],
    );
    return result.rows[0];
  }

  async update(id: number, data: { name?: string }): Promise<Position | null> {
    const result: QueryResult<Position> = await this.pgPool.query(
      `update positions
       set name = coalesce($2, name),
           updated_at = now()
       where id_position = $1
       returning *`,
      [id, data.name],
    );
    return result.rows[0] ?? null;
  }

  async delete(id: number): Promise<Position | null> {
    const result: QueryResult<Position> = await this.pgPool.query(
      `update positions
       set deleted_at = now()
       where id_position = $1
       returning *`,
      [id],
    );
    return result.rows[0] ?? null;
  }
}
