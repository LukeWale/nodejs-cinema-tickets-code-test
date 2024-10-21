import express from "express";
import bodyParser from "body-parser";
import swaggerUI from "swagger-ui-express";
import yaml from "yaml";
import fs from "fs";
import { router } from "./routes.js";
import helmet from "helmet";

export const makeApp = ({ logger }) => {
  const app = express();

  const loggerMiddleware = logger.getLogger;
  app.use(loggerMiddleware);

  app.use(bodyParser.json());

  app.disable("x-powered-by");
  app.use(helmet());

  const openApiYaml = fs.readFileSync("./api/openapi.yaml", "utf8");

  const convertedSwaggerDoc = yaml.parse(openApiYaml);

  app.use("/swagger", swaggerUI.serve, swaggerUI.setup(convertedSwaggerDoc));

  app.use("/", router());

  app.use((req, res) => {
    res.status(404).json({
      message: "Unknown endpoint",
    });
  });

  return app;
};
