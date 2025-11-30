/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.createTable('employees', {
    id_employee: {
      type: 'serial',
      primaryKey: true
    },
    last_name: {
      type: 'varchar(100)',
      notNull: true
    },
    first_name: {
      type: 'varchar(100)',
      notNull: true
    },
    middle_name: {
      type: 'varchar(100)'
    },
    birth_date: {
      type: 'date',
      notNull: true
    },
    passport_data: {
      type: 'text',
      notNull: true
    },
    registration_address: {
      type: 'text',
      notNull: true
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('now()')
    },
    updated_at: {
      type: 'timestamp'
    },
    deleted_at: {
      type: 'timestamp'
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.dropTable('employees');
};
