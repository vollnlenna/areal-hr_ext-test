/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.createTable('passport_scans', {
    id_passport_scan: {
      type: 'serial',
      primaryKey: true
    },
    id_employee: {
      type: 'integer',
      notNull: true,
      references: '"employees"',
      onDelete: 'cascade'
    },
    id_file: {
      type: 'integer',
      notNull: true,
      references: '"files"',
      onDelete: 'cascade'
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.dropTable('passport_scans');
};
