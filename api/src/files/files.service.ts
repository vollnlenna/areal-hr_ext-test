import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

export interface File {
  id_file: number;
  file_name: string;
  file_path: string;
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

@Injectable()
export class FilesService {
  constructor(@Inject('PG_POOL') private readonly pgPool: Pool) {}

  async getAll(): Promise<File[]> {
    const result: QueryResult<File> =
      await this.pgPool.query(`select * from files`);
    return result.rows;
  }

  async getById(id: number): Promise<File | null> {
    const result: QueryResult<File> = await this.pgPool.query(
      `select * from files where id_file = $1 and deleted_at is null`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async create(data: { file_name: string; file_path: string }): Promise<File> {
    const result: QueryResult<File> = await this.pgPool.query(
      `insert into files (file_name, file_path, created_at, updated_at)
       values ($1, $2, now(), now()) returning *`,
      [data.file_name, data.file_path],
    );
    return result.rows[0];
  }

  async update(
    id: number,
    data: {
      file_name?: string;
      file_path?: string;
    },
  ): Promise<File | null> {
    const result: QueryResult<File> = await this.pgPool.query(
      `update files
       set file_name = coalesce($2, file_name),
           file_path = coalesce($3, file_path),
           updated_at = now()
       where id_file = $1
       returning *`,
      [id, data.file_name, data.file_path],
    );
    return result.rows[0] ?? null;
  }

  async delete(id: number): Promise<File | null> {
    const result: QueryResult<File> = await this.pgPool.query(
      `update files set deleted_at = now() where id_file = $1 returning *`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async restore(id: number): Promise<File | null> {
    const result: QueryResult<File> = await this.pgPool.query(
      `update files set deleted_at = null where id_file = $1 and deleted_at is not null returning *`,
      [id],
    );
    return result.rows[0] ?? null;
  }
}
