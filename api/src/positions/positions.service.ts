import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import { ChangeHistoryService } from '../change-history/change-history.service';
import { logEntityChanges } from '../change-history/log-change';

export interface Position {
  id_position: number;
  name: string;
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;

  [key: string]: unknown;
}

@Injectable()
export class PositionsService {
  constructor(
    @Inject('PG_POOL') private readonly pgPool: Pool,
    private readonly history: ChangeHistoryService,
  ) {}

  async getAll(): Promise<Position[]> {
    const result: QueryResult<Position> = await this.pgPool.query(
      `select * from positions where deleted_at is null`,
    );
    return result.rows;
  }

  async getDeleted(): Promise<Position[]> {
    const result: QueryResult<Position> = await this.pgPool.query(
      `select * from positions where deleted_at is not null`,
    );
    return result.rows;
  }

  async getById(id: number): Promise<Position | null> {
    const result: QueryResult<Position> = await this.pgPool.query(
      `select * from positions where id_position = $1`,
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
    const created = result.rows[0];
    await logEntityChanges(this.history, {
      entity: 'position',
      oldRow: {} as Position,
      newRow: created,
    });
    return created;
  }

  async update(id: number, data: { name?: string }): Promise<Position | null> {
    const oldRow = await this.getById(id);
    if (!oldRow) return null;

    const result: QueryResult<Position> = await this.pgPool.query(
      `update positions
       set name = coalesce($2, name),
           updated_at = now()
       where id_position = $1
       returning *`,
      [id, data.name],
    );
    const newRow = result.rows[0];
    if (newRow) {
      await logEntityChanges(this.history, {
        entity: 'position',
        oldRow,
        newRow,
      });
    }
    return newRow ?? null;
  }

  async delete(id: number): Promise<Position | null> {
    const oldRow = await this.getById(id);
    if (!oldRow) return null;

    const result: QueryResult<Position> = await this.pgPool.query(
      `update positions
       set deleted_at = now()
       where id_position = $1
       returning *`,
      [id],
    );
    const newRow = result.rows[0];
    if (newRow) {
      await logEntityChanges(this.history, {
        entity: 'position',
        oldRow,
        newRow,
      });
    }
    return newRow ?? null;
  }

  async restore(id: number): Promise<Position | null> {
    const oldRow = await this.getById(id);
    if (!oldRow) return null;

    const result: QueryResult<Position> = await this.pgPool.query(
      `update positions
       set deleted_at = null
       where id_position = $1 and deleted_at is not null
       returning *`,
      [id],
    );
    const newRow = result.rows[0];
    if (newRow) {
      await logEntityChanges(this.history, {
        entity: 'position',
        oldRow,
        newRow,
      });
    }
    return newRow ?? null;
  }
}
