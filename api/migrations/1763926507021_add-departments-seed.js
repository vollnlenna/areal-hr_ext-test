/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.sql(`
    insert into departments (name, id_organization, id_parent_department) values
      ('Руководство ООО Альфа', 1, null),
      ('Технический отдел', 1, 1),
      ('Разработка', 1, 2),
      ('Backend разработка', 1, 3),
      ('Frontend разработка', 1, 3),
      ('Тестирование', 1, 2),
      ('Административный отдел', 1, 1),
      ('HR отдел', 1, 7),
      ('Бухгалтерия', 1, 7),
      ('Юридический отдел', 1, 7);

    insert into departments (name, id_organization, id_parent_department) values
      ('Руководство ООО Бета', 2, null),
      ('Коммерческий отдел', 2, 11),
      ('Отдел продаж', 2, 12),
      ('Корпоративные продажи', 2, 13),
      ('Розничные продажи', 2, 13),
      ('Маркетинг', 2, 12),
      ('Административный отдел', 2, 11),
      ('Бухгалтерия', 2, 17),
      ('Юридический отдел', 2, 17),
      ('Снабжение', 2, 17);

    insert into departments (name, id_organization, id_parent_department) values
      ('Руководство АО Гамма', 3, null),
      ('IT отдел', 3, 21),
      ('Разработка', 3, 22),
      ('Web разработка', 3, 23),
      ('Mobile разработка', 3, 23),
      ('Тестирование', 3, 22),
      ('Техподдержка', 3, 22),
      ('HR отдел', 3, 21),
      ('Бухгалтерия', 3, 21),
      ('Юридический отдел', 3, 21);

    insert into departments (name, id_organization, id_parent_department) values
      ('Руководство ЗАО Дельта', 4, null),
      ('Производственный отдел', 4, 31),
      ('Производство', 4, 32),
      ('Цех А', 4, 33),
      ('Секция 1', 4, 34),
      ('Секция 2', 4, 34),
      ('Цех Б', 4, 33),
      ('Логистика', 4, 32),
      ('Бухгалтерия', 4, 31),
      ('Отдел снабжения', 4, 31);

    insert into departments (name, id_organization, id_parent_department) values
      ('Руководство ПАО Омега', 5, null),
      ('Коммерческий отдел', 5, 41),
      ('Отдел продаж', 5, 42),
      ('Внутренние продажи', 5, 43),
      ('Внешние продажи', 5, 43),
      ('Маркетинг', 5, 42),
      ('Технический отдел', 5, 41),
      ('Разработка', 5, 47),
      ('Backend', 5, 48),
      ('Frontend', 5, 48),
      ('Бухгалтерия', 5, 41),
      ('Юридический отдел', 5, 41);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.sql(`delete from departments;`);
};
