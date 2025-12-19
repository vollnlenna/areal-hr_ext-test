import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import { ChangeHistoryService } from '../change-history/change-history.service';
import { logEntityChanges } from '../change-history/log-change';

export interface Employee {
  id_employee: number;
  last_name: string;
  first_name: string;
  middle_name?: string | null;
  birth_date: string;
  passport_data: string;
  registration_address: string;
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;

  [key: string]: unknown;
}

@Injectable()
export class EmployeesService {
  constructor(
    @Inject('PG_POOL') private readonly pgPool: Pool,
    private readonly history: ChangeHistoryService,
  ) {}

  async getAll(): Promise<Employee[]> {
    const result: QueryResult<Employee> = await this.pgPool.query(
      `select * from employees where deleted_at is null`,
    );
    return result.rows;
  }

  async getDeleted(): Promise<Employee[]> {
    const result: QueryResult<Employee> = await this.pgPool.query(
      `select * from employees where deleted_at is not null`,
    );
    return result.rows;
  }

  async getById(id: number): Promise<Employee | null> {
    const result: QueryResult<Employee> = await this.pgPool.query(
      `select * from employees where id_employee = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async create(
    data: {
      last_name: string;
      first_name: string;
      middle_name?: string;
      birth_date: string;
      passport_data: string;
      registration_address: string;
    },
    id_user: number,
  ): Promise<Employee> {
    const result: QueryResult<Employee> = await this.pgPool.query(
      `insert into employees (last_name, first_name, middle_name, birth_date, passport_data, registration_address, created_at, updated_at)
       values ($1, $2, $3, $4, $5, $6, now(), now())
         returning *`,
      [
        data.last_name,
        data.first_name,
        data.middle_name ?? null,
        data.birth_date,
        data.passport_data,
        data.registration_address,
      ],
    );
    const created = result.rows[0];
    await logEntityChanges(this.history, {
      entity: 'employee',
      oldRow: {} as Employee,
      newRow: created,
      id_user,
    });
    return created;
  }

  async update(
    id: number,
    data: {
      last_name?: string;
      first_name?: string;
      middle_name?: string;
      birth_date?: string;
      passport_data?: string;
      registration_address?: string;
    },
    id_user: number,
  ): Promise<Employee | null> {
    const oldRow = await this.getById(id);
    if (!oldRow) return null;

    const result: QueryResult<Employee> = await this.pgPool.query(
      `update employees
       set last_name = coalesce($2, last_name),
           first_name = coalesce($3, first_name),
           middle_name = $4,
           birth_date = coalesce($5, birth_date),
           passport_data = coalesce($6, passport_data),
           registration_address = coalesce($7, registration_address),
           updated_at = now()
       where id_employee = $1
         returning *`,
      [
        id,
        data.last_name,
        data.first_name,
        data.middle_name ?? null,
        data.birth_date,
        data.passport_data,
        data.registration_address,
      ],
    );
    const newRow = result.rows[0];
    if (newRow) {
      await logEntityChanges(this.history, {
        entity: 'employee',
        oldRow,
        newRow,
        id_user,
      });
    }
    return newRow ?? null;
  }

  async delete(id: number, id_user: number): Promise<Employee | null> {
    const oldRow = await this.getById(id);
    if (!oldRow) return null;

    const result: QueryResult<Employee> = await this.pgPool.query(
      `update employees
       set deleted_at = now()
       where id_employee = $1
         returning *`,
      [id],
    );
    const newRow = result.rows[0];
    if (newRow) {
      await logEntityChanges(this.history, {
        entity: 'employee',
        oldRow,
        newRow,
        id_user,
      });
    }
    return newRow ?? null;
  }

  async restore(id: number, id_user: number): Promise<Employee | null> {
    const oldRow = await this.getById(id);
    if (!oldRow) return null;

    const result: QueryResult<Employee> = await this.pgPool.query(
      `update employees
       set deleted_at = null
       where id_employee = $1 and deleted_at is not null
         returning *`,
      [id],
    );
    const newRow = result.rows[0];
    if (newRow) {
      await logEntityChanges(this.history, {
        entity: 'employee',
        oldRow,
        newRow,
        id_user,
      });
    }
    return newRow ?? null;
  }

  async search(
    query: string,
    limit = 5,
    offset = 0,
  ): Promise<{ items: Employee[]; hasMore: boolean }> {
    const q = `%${query.toLowerCase()}%`;
    const result: QueryResult<Employee> = await this.pgPool.query(
      `select *
       from employees
       where deleted_at is null
         and lower(last_name || ' ' || first_name || ' ' || coalesce(middle_name, '')) like $1
       order by last_name, first_name, middle_name
         limit $2 offset $3`,
      [q, limit, offset],
    );
    const nextCheck: QueryResult = await this.pgPool.query(
      `select 1
       from employees
       where deleted_at is null
         and lower(last_name || ' ' || first_name || coalesce(middle_name, '')) like $1
       offset $2
         limit 1`,
      [q, offset + limit],
    );
    return {
      items: result.rows,
      hasMore: nextCheck.rows.length > 0,
    };
  }
}
