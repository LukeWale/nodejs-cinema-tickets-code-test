import { Router } from "express";

const router = Router();

export const homeRouter = () => {
  router.get("/", (req, res) => {
    res.status(200).send({ message: "Application home" });
  });

  return router;
};
