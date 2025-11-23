/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.sql(`
    insert into positions (name)
    values
      ('Генеральный директор'),
      ('Главный бухгалтер'),
      ('Бухгалтер'),
      ('Менеджер по продажам'),
      ('Инженер'),
      ('HR-специалист'),
      ('Системный администратор'),
      ('Секретарь');
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.sql(`delete from positions;`);
};
