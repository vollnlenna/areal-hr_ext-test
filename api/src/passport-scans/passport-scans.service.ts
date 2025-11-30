import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

export interface PassportScan {
  id_passport_scan: number;
  id_employee: number;
  id_file: number;
}

@Injectable()
export class PassportScansService {
  constructor(@Inject('PG_POOL') private readonly pgPool: Pool) {}

  async getByEmployee(employeeId: number): Promise<PassportScan[]> {
    const result: QueryResult<PassportScan> = await this.pgPool.query(
      `select ps.*, f.file_name, f.file_path 
       from passport_scans ps 
       join files f on ps.id_file = f.id_file 
       where ps.id_employee = $1 
       order by ps.id_passport_scan desc`,
      [employeeId],
    );
    return result.rows;
  }

  async create(data: {
    id_employee: number;
    id_file: number;
  }): Promise<PassportScan> {
    const result: QueryResult<PassportScan> = await this.pgPool.query(
      `insert into passport_scans (id_employee, id_file)
       values ($1, $2) returning *`,
      [data.id_employee, data.id_file],
    );
    return result.rows[0];
  }

  async delete(id: number): Promise<PassportScan | null> {
    const result: QueryResult<PassportScan> = await this.pgPool.query(
      `delete from passport_scans where id_passport_scan = $1 returning *`,
      [id],
    );
    return result.rows[0] ?? null;
  }
}
