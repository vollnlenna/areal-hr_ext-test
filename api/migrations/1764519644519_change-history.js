/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.createTable('change_history', {
    id_change_history: {
      type: 'serial',
      primaryKey: true
    },
    id_user: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'restrict'
    },
    id_organization: {
      type: 'integer',
      references: '"organizations"',
      onDelete: 'set null'
    },
    id_department: {
      type: 'integer',
      references: '"departments"',
      onDelete: 'set null'
    },
    id_position: {
      type: 'integer',
      references: '"positions"',
      onDelete: 'set null'
    },
    id_employee: {
      type: 'integer',
      references: '"employees"',
      onDelete: 'set null'
    },
    id_hr_operation: {
      type: 'integer',
      references: '"hr_operations"',
      onDelete: 'set null'
    },
    field_name: {
      type: 'varchar(100)'
    },
    old_value: {
      type: 'text'
    },
    new_value: {
      type: 'text'
    },
    changed_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('now()')
    }
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.dropTable('change_history');
};
