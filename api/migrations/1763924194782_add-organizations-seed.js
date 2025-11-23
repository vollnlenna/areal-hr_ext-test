/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.sql(`
    insert into organizations (name, comment)
    values
      ('ООО Альфа', null),
      ('ООО Бета', null),
      ('АО Гамма', null),
      ('ЗАО Дельта', null),
      ('ПАО Омега', null);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.sql(`delete from organizations;`);
};
