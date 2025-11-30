import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

export interface ChangeHistory {
  id_change_history: number;
  id_user: number;
  id_organization?: number | null;
  id_department?: number | null;
  id_position?: number | null;
  id_employee?: number | null;
  id_hr_operation?: number | null;
  field_name?: string | null;
  old_value?: string | null;
  new_value?: string | null;
  changed_at: Date;
}

@Injectable()
export class ChangeHistoryService {
  constructor(@Inject('PG_POOL') private readonly pgPool: Pool) {}

  async getAll(): Promise<ChangeHistory[]> {
    const result: QueryResult<ChangeHistory> = await this.pgPool.query(
      `select * from change_history order by changed_at desc`,
    );
    return result.rows;
  }

  async getById(id: number): Promise<ChangeHistory | null> {
    const result: QueryResult<ChangeHistory> = await this.pgPool.query(
      `select * from change_history where id_change_history = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async create(data: {
    id_user: number;
    id_organization?: number;
    id_department?: number;
    id_position?: number;
    id_employee?: number;
    id_hr_operation?: number;
    field_name?: string;
    old_value?: string;
    new_value?: string;
  }): Promise<ChangeHistory> {
    const result: QueryResult<ChangeHistory> = await this.pgPool.query(
      `insert into change_history 
       (id_user, id_organization, id_department, id_position, id_employee, id_hr_operation, field_name, old_value, new_value, changed_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, now()) 
       returning *`,
      [
        data.id_user,
        data.id_organization || null,
        data.id_department || null,
        data.id_position || null,
        data.id_employee || null,
        data.id_hr_operation || null,
        data.field_name || null,
        data.old_value || null,
        data.new_value || null,
      ],
    );
    return result.rows[0];
  }
}
