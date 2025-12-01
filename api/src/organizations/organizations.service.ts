import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

export interface Organization {
  id_organization: number;
  name: string;
  comment?: string | null;
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

@Injectable()
export class OrganizationsService {
  constructor(@Inject('PG_POOL') private readonly pgPool: Pool) {}

  async getAll(): Promise<Organization[]> {
    const result: QueryResult<Organization> = await this.pgPool.query(
      `select * from organizations where deleted_at is null`,
    );
    return result.rows;
  }

  async getDeleted(): Promise<Organization[]> {
    const result: QueryResult<Organization> = await this.pgPool.query(
      `select * from organizations where deleted_at is not null`,
    );
    return result.rows;
  }

  async getById(id: number): Promise<Organization | null> {
    const result: QueryResult<Organization> = await this.pgPool.query(
      `select * from organizations where id_organization = $1 and deleted_at is null`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async create(data: {
    name: string;
    comment?: string | null;
  }): Promise<Organization> {
    const result: QueryResult<Organization> = await this.pgPool.query(
      `
      insert into organizations (name, comment, created_at, updated_at)
      values ($1, $2, now(), now())
      returning *
      `,
      [data.name, data.comment || null],
    );
    return result.rows[0];
  }

  async update(
    id: number,
    data: { name?: string; comment?: string | null },
  ): Promise<Organization | null> {
    const result: QueryResult<Organization> = await this.pgPool.query(
      `
      update organizations
      set name = coalesce($2, name),
          comment = coalesce($3, comment),
          updated_at = now()
      where id_organization = $1
      returning *
      `,
      [id, data.name, data.comment],
    );
    return result.rows[0] ?? null;
  }

  async delete(id: number): Promise<Organization | null> {
    const result: QueryResult<Organization> = await this.pgPool.query(
      `
      update organizations
      set deleted_at = now()
      where id_organization = $1
      returning *
      `,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async restore(id: number): Promise<Organization | null> {
    const result: QueryResult<Organization> = await this.pgPool.query(
      `update organizations
       set deleted_at = null
       where id_organization = $1 and deleted_at is not null
       returning *`,
      [id],
    );
    return result.rows[0] ?? null;
  }
}
