import winston from "winston";
import morgan from "morgan";

const { combine, timestamp, printf, json } = winston.format;

// This enables the log levels of error, warn, info, and debug.
export const makeLogger = () => {
  const logger = winston.createLogger({
    level: "info",
    format: combine(
      timestamp({
        format: "YYYY-MM-DD HH:mm:ss.SSS",
      }),
      printf(({ level, message, timestamp }) => {
        return JSON.stringify({ level, timestamp, message });
      }),
    ),
    transports: [new winston.transports.Console()],
  });

  const getLogger = morgan(
    (tokens, req, res) => {
      let contentLength;
      if (tokens.res["content-length"] != undefined) {
        contentLength = ` | Content Length: ${tokens.res(req, res, "content-length")} `;
      }

      return [
        "Method: ",
        tokens.method(req, res),
        " | URL: ",
        `'${tokens.url(req, res)}'`,
        " | Status: ",
        tokens.status(req, res),
        contentLength,
        " | Response Time: ",
        `${tokens["response-time"](req, res)}ms`,
      ].join("");
    },
    {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    },
  );

  return {
    info: (message) => logger.info(message),
    debug: (message) => logger.debug(message),
    warn: (message) => logger.warn(message),
    error: (message) => logger.error(message),
    getLogger,
  };
};
