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

type MulterFile = Express.Multer.File;

@Injectable()
export class FilesService {
  constructor(@Inject('PG_POOL') private readonly pgPool: Pool) {}

  async saveUploadedFile(
    file: MulterFile,
    userFileName: string,
  ): Promise<File> {
    const extMatch = file.originalname.match(/\.[^.]+$/);
    const ext = extMatch ? extMatch[0].toLowerCase() : '';
    const finalName = `${userFileName}${ext}`;
    const relPath = file.filename;

    const result: QueryResult<File> = await this.pgPool.query(
      `insert into files (file_name, file_path, created_at, updated_at)
       values ($1, $2, now(), now()) returning *`,
      [finalName, relPath],
    );
    return result.rows[0];
  }

  async getAll(): Promise<File[]> {
    const result: QueryResult<File> = await this.pgPool.query(
      `select * from files where deleted_at is null order by id_file desc`,
    );
    return result.rows;
  }

  async delete(id: number): Promise<File | null> {
    const result: QueryResult<File> = await this.pgPool.query(
      `update files set deleted_at = now()
       where id_file = $1 and deleted_at is null
         returning *`,
      [id],
    );
    return result.rows[0] ?? null;
  }
}
