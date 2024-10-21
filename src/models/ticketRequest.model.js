import Joi from "joi";

export const ticketRequestBodyModel = Joi.object({
  accountId: Joi.number().required(),
  ticketTypes: Joi.array().required(),
});
