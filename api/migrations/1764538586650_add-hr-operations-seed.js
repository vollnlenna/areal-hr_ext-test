/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.sql(`
    insert into hr_operations (id_employee, id_department, id_position, salary, is_active, created_at, updated_at)
    values
      (1, 1, 1, 250000.00, true, now(), now()),
      (2, 2, 2, 150000.00, true, now(), now()),
      (3, 7, 7, 120000.00, true, now(), now()),
      (4, 10, 6, 100000.00, true, now(), now()),
      (5, 4, 4, 90000.00, false, now(), now());
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.sql(`delete from hr_operations;`);
};
