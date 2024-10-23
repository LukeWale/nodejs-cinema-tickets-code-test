import { Router } from "express";
import { ticketRequest } from "../controllers/ticketRequest.controller.js";
import { ticketRequestBodyModel } from "../models/ticketRequest.model.js";
import requestValidator from "../middleware/requestValidator.middleware.js";

const router = Router();

export const ticketRequestRouter = () => {
  router
    .route("/request")
    .post(requestValidator("body", ticketRequestBodyModel), ticketRequest());

  return router;
};
