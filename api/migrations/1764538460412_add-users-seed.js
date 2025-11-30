/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.sql(`
    insert into users (last_name, first_name, middle_name, login, password_hash, id_role, created_at, updated_at)
    values
      ('Иванов', 'Алексей', 'Петрович', 'admin', '$argon2id$v=19$m=16,t=2,p=1$N3BTd0xFZkNaY3dxaDllaA$qloFL5jMhiSfwgNBweuS4g', 1, now(), now()),
      ('Петрова', 'Елена', 'Сергеевна', 'manager', '$argon2id$v=19$m=16,t=2,p=1$TkUyY2pDSURHSURzWk54Ng$1vMmGAqzPa6FQba+KJkH1w', 2, now(), now());
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.sql(`delete from users;`);
};
