import { makeApp } from "./app.js";
import { makeLogger } from "./services/logger.js";
import config from "./config/config.js";

const { PORT } = config;

const startServer = () => {
  const logger = makeLogger();
  const app = makeApp({ logger });

  const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });

  process.on("SIGTERM", () => {
    logger.info("SIGTERM signal received: closing HTTP server");
    server.close(() => {
      logger.info("HTTP server closed");
    });
  });
};

export default startServer;
