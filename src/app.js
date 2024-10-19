import express from "express";
import bodyParser from "body-parser";

export const makeApp = ({ logger }) => {
  const app = express();

  const loggerMiddleware = logger.getLogger;
  app.use(loggerMiddleware);

  app.use(bodyParser.json());

  app.get("/", (req, res) => {
    res.status(200).send({ message: "Application home" });
  });

  app.use((req, res) => {
    res.status(404).json({
      message: "Unknown endpoint",
    });
  });

  return app;
};
