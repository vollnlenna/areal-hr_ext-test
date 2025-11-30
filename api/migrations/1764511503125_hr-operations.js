/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.createTable('hr_operations', {
    id_hr_operation: {
      type: 'serial',
      primaryKey: true
    },
    id_employee: {
      type: 'integer',
      notNull: true,
      references: '"employees"',
      onDelete: 'cascade'
    },
    id_department: {
      type: 'integer',
      notNull: true,
      references: '"departments"',
      onDelete: 'cascade'
    },
    id_position: {
      type: 'integer',
      notNull: true,
      references: '"positions"',
      onDelete: 'cascade'
    },
    is_active: {
      type: 'boolean',
      notNull: true,
      default: true
    },
    salary: {
      type: 'decimal(10,2)',
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
    }
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.dropTable('hr_operations');
};
