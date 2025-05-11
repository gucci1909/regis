import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  }),
);

const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/app.log'),
    }),
  ],
});

logger.add(
  new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), logFormat),
  }),
);

export default logger;
