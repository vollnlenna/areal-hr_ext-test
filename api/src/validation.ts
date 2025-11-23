import Joi from 'joi';

export const validateOrganization = Joi.object({
  name: Joi.string().min(2).required(),
  comment: Joi.string().allow(null).optional(),
});

export const validateDepartment = Joi.object({
  name: Joi.string().min(2).required(),
  id_organization: Joi.number().required(),
  id_parent_department: Joi.number().allow(null).optional(),
  comment: Joi.string().allow(null).optional(),
});

export const validatePosition = Joi.object({
  name: Joi.string().min(2).required(),
});
