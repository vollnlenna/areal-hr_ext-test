import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

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
}

@Injectable()
export class EmployeesService {
  constructor(@Inject('PG_POOL') private readonly pgPool: Pool) {}

  async getAll(): Promise<Employee[]> {
    const result: QueryResult<Employee> = await this.pgPool.query(
      `select * from employees`,
    );
    return result.rows;
  }

  async getById(id: number): Promise<Employee | null> {
    const result: QueryResult<Employee> = await this.pgPool.query(
      `select * from employees where id_employee = $1 and deleted_at is null`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async create(data: {
    last_name: string;
    first_name: string;
    middle_name?: string;
    birth_date: string;
    passport_data: string;
    registration_address: string;
  }): Promise<Employee> {
    const result: QueryResult<Employee> = await this.pgPool.query(
      `insert into employees (last_name, first_name, middle_name, birth_date, passport_data, registration_address, created_at, updated_at)
       values ($1, $2, $3, $4, $5, $6, now(), now()) returning *`,
      [
        data.last_name,
        data.first_name,
        data.middle_name || null,
        data.birth_date,
        data.passport_data,
        data.registration_address,
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
      birth_date?: string;
      passport_data?: string;
      registration_address?: string;
    },
  ): Promise<Employee | null> {
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
        data.middle_name,
        data.birth_date,
        data.passport_data,
        data.registration_address,
      ],
    );
    return result.rows[0] ?? null;
  }

  async delete(id: number): Promise<Employee | null> {
    const result: QueryResult<Employee> = await this.pgPool.query(
      `update employees set deleted_at = now() where id_employee = $1 returning *`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async restore(id: number): Promise<Employee | null> {
    const result: QueryResult<Employee> = await this.pgPool.query(
      `update employees set deleted_at = null where id_employee = $1 and deleted_at is not null returning *`,
      [id],
    );
    return result.rows[0] ?? null;
  }
}
