import express from "express";
import { ticketRequestRouter } from "./routes/ticketRequest.router.js";
import { homeRouter } from "./routes/home.router.js";

const { Router } = express;

export const router = () => {
  const r = Router();
  r.use("/", homeRouter());
  r.use("/tickets", ticketRequestRouter());
  return r;
};
