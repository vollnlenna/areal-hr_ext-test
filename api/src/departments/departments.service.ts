import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

export interface Department {
  id_department: number;
  name: string;
  id_organization: number;
  id_parent_department?: number | null;
  comment?: string | null;
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

@Injectable()
export class DepartmentsService {
  constructor(@Inject('PG_POOL') private readonly pgPool: Pool) {}

  async getAll(): Promise<Department[]> {
    const result: QueryResult<Department> = await this.pgPool.query(
      `select * from departments`,
    );
    return result.rows;
  }

  async getById(id: number): Promise<Department | null> {
    const result: QueryResult<Department> = await this.pgPool.query(
      `select * from departments where id_department = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async create(data: {
    name: string;
    id_organization: number;
    id_parent_department?: number | null;
    comment?: string | null;
  }): Promise<Department> {
    const result: QueryResult<Department> = await this.pgPool.query(
      `insert into departments (name, id_organization, id_parent_department, comment, created_at)
       values ($1, $2, $3, $4, now()) returning *`,
      [
        data.name,
        data.id_organization,
        data.id_parent_department || null,
        data.comment || null,
      ],
    );
    return result.rows[0];
  }

  async update(
    id: number,
    data: {
      name?: string;
      id_organization?: number;
      id_parent_department?: number | null;
      comment?: string | null;
    },
  ): Promise<Department | null> {
    const result: QueryResult<Department> = await this.pgPool.query(
      `update departments
       set name = coalesce($2, name),
           id_organization = coalesce($3, id_organization),
           id_parent_department = $4,
           comment = coalesce($5, comment),
           updated_at = now()
       where id_department = $1
         returning *`,
      [
        id,
        data.name,
        data.id_organization,
        data.id_parent_department,
        data.comment,
      ],
    );
    return result.rows[0] ?? null;
  }

  async delete(id: number): Promise<Department | null> {
    const result: QueryResult<Department> = await this.pgPool.query(
      `update departments
       set deleted_at = NOW()
       where id_department = $1
       returning *`,
      [id],
    );
    return result.rows[0] ?? null;
  }
}
