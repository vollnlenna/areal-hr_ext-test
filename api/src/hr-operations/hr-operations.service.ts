import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import { ChangeHistoryService } from '../change-history/change-history.service';
import { logEntityChanges } from '../change-history/log-change';

export interface HrOperation {
  id_hr_operation: number;
  id_employee: number;
  id_department: number;
  id_position: number;
  salary: number;
  is_active: boolean;
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;

  [key: string]: unknown;
}

@Injectable()
export class HrOperationsService {
  constructor(
    @Inject('PG_POOL') private readonly pgPool: Pool,
    private readonly history: ChangeHistoryService,
  ) {}

  async getAll(): Promise<HrOperation[]> {
    const result: QueryResult<HrOperation> = await this.pgPool.query(
      `select * from hr_operations where deleted_at is null`,
    );
    return result.rows;
  }

  async getDeleted(): Promise<HrOperation[]> {
    const result: QueryResult<HrOperation> = await this.pgPool.query(
      `select * from hr_operations where deleted_at is not null`,
    );
    return result.rows;
  }

  async getById(id: number): Promise<HrOperation | null> {
    const result: QueryResult<HrOperation> = await this.pgPool.query(
      `select * from hr_operations where id_hr_operation = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async create(data: {
    id_employee: number;
    id_department: number;
    id_position: number;
    salary: number;
    is_active?: boolean;
  }): Promise<HrOperation> {
    const result: QueryResult<HrOperation> = await this.pgPool.query(
      `insert into hr_operations (id_employee, id_department, id_position, salary, is_active, created_at, updated_at)
       values ($1, $2, $3, $4, $5, now(), now()) returning *`,
      [
        data.id_employee,
        data.id_department,
        data.id_position,
        data.salary,
        data.is_active ?? true,
      ],
    );
    const created = result.rows[0];
    await logEntityChanges(this.history, {
      entity: 'hr_operation',
      oldRow: {} as HrOperation,
      newRow: created,
    });
    return created;
  }

  async update(
    id: number,
    data: {
      id_department?: number;
      id_position?: number;
      salary?: number;
      is_active?: boolean;
    },
  ): Promise<HrOperation | null> {
    const oldRow = await this.getById(id);
    if (!oldRow) return null;

    const result: QueryResult<HrOperation> = await this.pgPool.query(
      `update hr_operations
       set id_department = coalesce($2, id_department),
           id_position = coalesce($3, id_position),
           salary = coalesce($4, salary),
           is_active = coalesce($5, is_active),
           updated_at = now()
       where id_hr_operation = $1
       returning *`,
      [id, data.id_department, data.id_position, data.salary, data.is_active],
    );
    const newRow = result.rows[0];
    if (newRow) {
      await logEntityChanges(this.history, {
        entity: 'hr_operation',
        oldRow,
        newRow,
      });
    }
    return newRow ?? null;
  }

  async delete(id: number): Promise<HrOperation | null> {
    const oldRow = await this.getById(id);
    if (!oldRow) return null;

    const result: QueryResult<HrOperation> = await this.pgPool.query(
      `update hr_operations set deleted_at = now() where id_hr_operation = $1 returning *`,
      [id],
    );
    const newRow = result.rows[0];
    if (newRow) {
      await logEntityChanges(this.history, {
        entity: 'hr_operation',
        oldRow,
        newRow,
      });
    }
    return newRow ?? null;
  }

  async restore(id: number): Promise<HrOperation | null> {
    const oldRow = await this.getById(id);
    if (!oldRow) return null;

    const result: QueryResult<HrOperation> = await this.pgPool.query(
      `update hr_operations set deleted_at = null where id_hr_operation = $1 and deleted_at is not null returning *`,
      [id],
    );
    const newRow = result.rows[0];
    if (newRow) {
      await logEntityChanges(this.history, {
        entity: 'hr_operation',
        oldRow,
        newRow,
      });
    }
    return newRow ?? null;
  }
}
