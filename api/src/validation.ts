import Joi from 'joi';

export const validateOrganization = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.empty': '‼️ Название организации обязательно',
    'string.base': '‼️ Название должно быть строкой',
    'string.min': '‼️ Название организации должно содержать минимум 2 символа',
    'string.max':
      '‼️ Название организации должно содержать не более 255 символов',
    'any.required': '‼️ Название обязательно',
  }),

  comment: Joi.string().allow(null).optional().messages({
    'string.base': '‼️ Комментарий должен быть строкой',
  }),
});

export const validateDepartment = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.empty': '‼️ Название отдела обязательно',
    'string.min': '‼️ Название отдела должно содержать минимум 2 символа',
    'string.max': '‼️ Название отдела должно содержать не более 255 символов',
    'any.required': '‼️ Название обязательно',
  }),

  id_organization: Joi.number().required().messages({
    'number.base': '‼️ Не выбрана организация',
    'any.required': '‼️ Организация обязательна',
  }),

  id_parent_department: Joi.number().allow(null).optional(),

  comment: Joi.string().allow(null).optional().messages({
    'string.base': '‼️ Комментарий должен быть строкой',
  }),
});

export const validatePosition = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.empty': '‼️ Название должности обязательно',
    'string.min': '‼️ Название должности должно содержать минимум 2 символа',
    'string.max':
      '‼️ Название должности должно содержать не более 255 символов',
    'any.required': '‼️ Название обязательно',
  }),
});
