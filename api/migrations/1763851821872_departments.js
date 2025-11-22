/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.createTable('departments', {
    id_department: {
      type: 'serial',
      primaryKey: true
    },
    name: {
      type: 'varchar(255)',
      notNull: true
    },
    id_organization: {
      type: 'integer',
      notNull: true,
      references: '"organizations"',
      onDelete: 'cascade'
    },
    id_parent_department: {
      type: 'integer',
      references: '"departments"',
      onDelete: 'set null'
    },
    comment: {
      type: 'text'
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
  pgm.dropTable('departments');
};
