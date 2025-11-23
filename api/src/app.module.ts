import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { DepartmentsModule } from './departments/departments.module';
import { PositionsModule } from './positions/positions.module';

@Module({
  imports: [
    DatabaseModule,
    OrganizationsModule,
    DepartmentsModule,
    PositionsModule,
  ],
})
export class AppModule {}
