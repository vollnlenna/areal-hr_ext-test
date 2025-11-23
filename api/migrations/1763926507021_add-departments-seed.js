/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.sql(`
    insert into departments (name, id_organization, id_parent_department, comment)
    values
      ('Дирекция', 1, null, null),
      ('Бухгалтерия', 1, null, null),
      ('Внутренний аудит', 1, 2, 'Подразделение внутри бухгалтерии'),

      ('Отдел продаж', 2, null, null),
      ('Склад', 2, null, null),
      ('Логистика', 2, 4, null),

      ('IT-отдел', 3, null, null),
      ('Сетевой сектор', 3, 7, null),
      ('Техническая поддержка', 3, 7, null),

      ('HR отдел', 4, null, null),
      ('Подбор персонала', 4, 10, null),
      ('Кадровое делопроизводство', 4, 10, null),

      ('Юридический отдел', 5, null, null),
      ('Отдел закупок', 5, null, null),
      ('Снабжение', 5, 14, null);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.sql(`delete from departments;`);
};
