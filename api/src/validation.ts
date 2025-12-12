import Joi from 'joi';

export const validateOrganization = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Название организации обязательно',
    'string.base': 'Название должно быть строкой',
    'string.min': 'Название организации должно содержать минимум 2 символа',
    'string.max': 'Название организации должно содержать не более 255 символов',
    'any.required': 'Название обязательно',
  }),

  comment: Joi.string().allow(null).optional().messages({
    'string.base': 'Комментарий должен быть строкой',
  }),
});

export const validateDepartment = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Название отдела обязательно',
    'string.min': 'Название отдела должно содержать минимум 2 символа',
    'string.max': 'Название отдела должно содержать не более 255 символов',
    'any.required': 'Название обязательно',
  }),

  id_organization: Joi.number().required().messages({
    'number.base': 'Организация обязательна',
    'any.required': 'Организация обязательна',
  }),

  id_parent_department: Joi.number().allow(null).optional(),

  comment: Joi.string().allow(null).optional().messages({
    'string.base': 'Комментарий должен быть строкой',
  }),
});

export const validatePosition = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Название должности обязательно',
    'string.min': 'Название должности должно содержать минимум 2 символа',
    'string.max': 'Название должности должно содержать не более 255 символов',
    'any.required': 'Название обязательно',
  }),
});

export const validateEmployee = Joi.object({
  last_name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Фамилия обязательна',
    'string.min': 'Фамилия должна содержать минимум 2 символа',
    'string.max': 'Фамилия должна содержать не более 100 символов',
    'any.required': 'Фамилия обязательна',
  }),

  first_name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Имя обязательно',
    'string.min': 'Имя должно содержать минимум 2 символа',
    'string.max': 'Имя должно содержать не более 100 символов',
    'any.required': 'Имя обязательно',
  }),

  middle_name: Joi.string()
    .min(2)
    .max(100)
    .allow(null, '')
    .optional()
    .messages({
      'string.min': 'Отчество должно содержать минимум 2 символа',
      'string.max': 'Отчество должно содержать не более 100 символов',
    }),

  birth_date: Joi.date().required().messages({
    'string.empty': 'Дата рождения обязательна',
    'date.base': 'Дата рождения должна быть валидной датой',
    'any.required': 'Дата рождения обязательна',
  }),

  passport_data: Joi.string().min(1).required().messages({
    'string.empty': 'Паспортные данные обязательны',
    'any.required': 'Паспортные данные обязательны',
  }),

  registration_address: Joi.string().min(1).required().messages({
    'string.empty': 'Адрес регистрации обязателен',
    'any.required': 'Адрес регистрации обязателен',
  }),
});

export const validateHrOperation = Joi.object({
  id_employee: Joi.number().required().messages({
    'number.base': 'Сотрудник обязателен',
    'any.required': 'Сотрудник обязателен',
  }),

  id_department: Joi.number().required().messages({
    'number.base': 'Отдел обязателен',
    'any.required': 'Отдел обязателен',
  }),

  id_position: Joi.number().required().messages({
    'number.base': 'Должность обязательна',
    'any.required': 'Должность обязательна',
  }),

  salary: Joi.number().min(0).required().messages({
    'number.base': 'Зарплата должна быть числом',
    'number.min': 'Зарплата не может быть отрицательной',
    'any.required': 'Зарплата обязательна',
  }),

  is_active: Joi.boolean().optional(),
});

export const validateFile = Joi.object({
  file_name: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Имя файла обязательно',
    'string.max': 'Имя файла должно содержать не более 100 символов',
    'any.required': 'Имя файла обязательно',
  }),
});

export const validateUser = Joi.object({
  last_name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Фамилия обязательна',
    'string.min': 'Фамилия должна содержать минимум 2 символа',
    'string.max': 'Фамилия должна содержать не более 100 символов',
    'any.required': 'Фамилия обязательна',
  }),

  first_name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Имя обязательно',
    'string.min': 'Имя должно содержать минимум 2 символа',
    'string.max': 'Имя должно содержать не более 100 символов',
    'any.required': 'Имя обязательно',
  }),

  middle_name: Joi.string()
    .min(2)
    .max(100)
    .allow(null, '')
    .optional()
    .messages({
      'string.min': 'Отчество должно содержать минимум 2 символа',
      'string.max': 'Отчество должно содержать не более 100 символов',
    }),

  login: Joi.string()
    .min(6)
    .max(100)
    .pattern(/^[a-zA-Z]+$/)
    .required()
    .messages({
      'string.empty': 'Логин обязателен',
      'string.min': 'Логин должен содержать минимум 6 символов',
      'string.max': 'Логин должен содержать не более 100 символов',
      'string.pattern.base': 'Логин должен содержать только латинские буквы',
      'any.required': 'Логин обязателен',
    }),

  id_role: Joi.number().required().messages({
    'number.base': 'Роль обязательна',
    'any.required': 'Роль обязательна',
  }),
});

export const validatePassword = Joi.object({
  password: Joi.string()
    .min(8)
    .max(100)
    .pattern(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]+$/)
    .required()
    .messages({
      'string.empty': 'Пароль обязателен',
      'string.min': 'Пароль должен содержать минимум 8 символов',
      'string.max': 'Пароль не должен превышать 100 символов',
      'string.pattern.base':
        'Пароль должен содержать только латинские буквы и хотя бы одну цифру',
      'any.required': 'Пароль обязателен',
    }),
});
