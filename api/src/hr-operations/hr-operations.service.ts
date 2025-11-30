import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

export interface HrOperation {
  id_hr_operation: number;
  id_employee: number;
  id_department: number;
  id_position: number;
  is_active: boolean;
  salary: number;
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

@Injectable()
export class HrOperationsService {
  constructor(@Inject('PG_POOL') private readonly pgPool: Pool) {}

  async getAll(): Promise<HrOperation[]> {
    const result: QueryResult<HrOperation> = await this.pgPool.query(
      `select * from hr_operations`,
    );
    return result.rows;
  }

  async getById(id: number): Promise<HrOperation | null> {
    const result: QueryResult<HrOperation> = await this.pgPool.query(
      `select * from hr_operations where id_hr_operation = $1 and deleted_at is null`,
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
    return result.rows[0];
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
    return result.rows[0] ?? null;
  }

  async delete(id: number): Promise<HrOperation | null> {
    const result: QueryResult<HrOperation> = await this.pgPool.query(
      `update hr_operations set deleted_at = now() where id_hr_operation = $1 returning *`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async restore(id: number): Promise<HrOperation | null> {
    const result: QueryResult<HrOperation> = await this.pgPool.query(
      `update hr_operations set deleted_at = null where id_hr_operation = $1 and deleted_at is not null returning *`,
      [id],
    );
    return result.rows[0] ?? null;
  }
}
