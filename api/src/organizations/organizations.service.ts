import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import { ChangeHistoryService } from '../change-history/change-history.service';
import { logEntityChanges } from '../change-history/log-change';

export interface Organization {
  id_organization: number;
  name: string;
  comment?: string | null;
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;

  [key: string]: unknown;
}

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject('PG_POOL') private readonly pgPool: Pool,
    private readonly history: ChangeHistoryService,
  ) {}

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
      `select * from organizations where id_organization = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async create(
    data: { name: string; comment?: string | null },
    id_user: number,
  ): Promise<Organization> {
    const result: QueryResult<Organization> = await this.pgPool.query(
      `
        insert into organizations (name, comment, created_at, updated_at)
        values ($1, $2, now(), now())
          returning *
      `,
      [data.name, data.comment ?? null],
    );
    const created = result.rows[0];
    await logEntityChanges(this.history, {
      entity: 'organization',
      oldRow: {} as Organization,
      newRow: created,
      id_user,
    });
    return created;
  }

  async update(
    id: number,
    data: { name?: string; comment?: string | null },
    id_user: number,
  ): Promise<Organization | null> {
    const oldRow = await this.getById(id);
    if (!oldRow) return null;

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
    const newRow = result.rows[0];
    if (newRow) {
      await logEntityChanges(this.history, {
        entity: 'organization',
        oldRow,
        newRow,
        id_user,
      });
    }
    return newRow ?? null;
  }

  async delete(id: number, id_user: number): Promise<Organization | null> {
    const oldRow = await this.getById(id);
    if (!oldRow) return null;

    const result: QueryResult<Organization> = await this.pgPool.query(
      `
      update organizations
      set deleted_at = now()
      where id_organization = $1
      returning *
      `,
      [id],
    );
    const newRow = result.rows[0];
    if (newRow) {
      await logEntityChanges(this.history, {
        entity: 'organization',
        oldRow,
        newRow,
        id_user,
      });
    }
    return newRow ?? null;
  }

  async restore(id: number, id_user: number): Promise<Organization | null> {
    const oldRow = await this.getById(id);
    if (!oldRow) return null;

    const result: QueryResult<Organization> = await this.pgPool.query(
      `update organizations
      set deleted_at = null
      where id_organization = $1 and deleted_at is not null
      returning *`,
      [id],
    );
    const newRow = result.rows[0];
    if (newRow) {
      await logEntityChanges(this.history, {
        entity: 'organization',
        oldRow,
        newRow,
        id_user,
      });
    }
    return newRow ?? null;
  }
}
