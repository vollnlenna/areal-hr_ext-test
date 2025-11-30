/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}}
 */
export const up = (pgm) => {
  pgm.createTable('users', {
    id_user: {
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
    login: {
      type: 'varchar(255)',
      notNull: true,
      unique: true
    },
    password_hash: {
      type: 'varchar(255)',
      notNull: true
    },
    id_role: {
      type: 'integer',
      references: '"roles"',
      notNull: true,
      onDelete: 'restrict'
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
  pgm.dropTable('users');
};
