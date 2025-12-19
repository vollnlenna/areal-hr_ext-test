import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import { ChangeHistoryService } from '../change-history/change-history.service';
import { logEntityChanges } from '../change-history/log-change';

export interface Department {
  id_department: number;
  name: string;
  id_organization: number;
  id_parent_department?: number | null;
  comment?: string | null;
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;

  [key: string]: unknown;
}

@Injectable()
export class DepartmentsService {
  constructor(
    @Inject('PG_POOL') private readonly pgPool: Pool,
    private readonly history: ChangeHistoryService,
  ) {}

  async getAll(): Promise<Department[]> {
    const result: QueryResult<Department> = await this.pgPool.query(
      `select * from departments where deleted_at is null`,
    );
    return result.rows;
  }

  async getDeleted(): Promise<Department[]> {
    const result: QueryResult<Department> = await this.pgPool.query(
      `select * from departments where deleted_at is not null`,
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

  async create(
    data: {
      name: string;
      id_organization: number;
      id_parent_department?: number | null;
      comment?: string | null;
    },
    id_user: number,
  ): Promise<Department> {
    const result: QueryResult<Department> = await this.pgPool.query(
      `insert into departments (name, id_organization, id_parent_department, comment, created_at, updated_at)
       values ($1, $2, $3, $4, now(), now()) returning *`,
      [
        data.name,
        data.id_organization,
        data.id_parent_department ?? null,
        data.comment ?? null,
      ],
    );
    const created = result.rows[0];
    await logEntityChanges(this.history, {
      entity: 'department',
      oldRow: {} as Department,
      newRow: created,
      id_user,
    });
    return created;
  }

  async update(
    id: number,
    data: {
      name?: string;
      id_organization?: number;
      id_parent_department?: number | null;
      comment?: string | null;
    },
    id_user: number,
  ): Promise<Department | null> {
    const oldRow = await this.getById(id);
    if (!oldRow) return null;

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
        data.id_parent_department ?? null,
        data.comment,
      ],
    );
    const newRow = result.rows[0];
    if (newRow) {
      await logEntityChanges(this.history, {
        entity: 'department',
        oldRow,
        newRow,
        id_user,
      });
    }
    return newRow ?? null;
  }

  async delete(id: number, id_user: number): Promise<Department | null> {
    const oldRow = await this.getById(id);
    if (!oldRow) return null;

    const result: QueryResult<Department> = await this.pgPool.query(
      `update departments
       set deleted_at = now()
       where id_department = $1
         returning *`,
      [id],
    );
    const newRow = result.rows[0];
    if (newRow) {
      await logEntityChanges(this.history, {
        entity: 'department',
        oldRow,
        newRow,
        id_user,
      });
    }
    return newRow ?? null;
  }

  async restore(id: number, id_user: number): Promise<Department | null> {
    const oldRow = await this.getById(id);
    if (!oldRow) return null;

    const result: QueryResult<Department> = await this.pgPool.query(
      `update departments
       set deleted_at = null
       where id_department = $1 and deleted_at is not null
         returning *`,
      [id],
    );
    const newRow = result.rows[0];
    if (newRow) {
      await logEntityChanges(this.history, {
        entity: 'department',
        oldRow,
        newRow,
        id_user,
      });
    }
    return newRow ?? null;
  }
}
