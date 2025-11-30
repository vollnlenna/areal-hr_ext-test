import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { DepartmentsModule } from './departments/departments.module';
import { PositionsModule } from './positions/positions.module';
import { EmployeesModule } from './employees/employees.module';
import { HrOperationsModule } from './hr-operations/hr-operations.module';
import { FilesModule } from './files/files.module';
import { ChangeHistoryModule } from './change-history/change-history.module';
import { PassportScansModule } from './passport-scans/passport-scans.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env'],
    }),
    DatabaseModule,
    OrganizationsModule,
    DepartmentsModule,
    PositionsModule,
    EmployeesModule,
    HrOperationsModule,
    FilesModule,
    ChangeHistoryModule,
    PassportScansModule,
  ],
})
export class AppModule {}
