import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import yargs from 'yargs/yargs';
import helmet from 'helmet';
import swaggerJsdoc from 'swagger-jsdoc';
import healthRoutes from './api/health/health.js';
import { hideBin } from 'yargs/helpers';
import swaggerUi from 'swagger-ui-express';
import otpRouter from "./api/otp/otp.js";
import logger from './utils/logger.js';
import projectRegisterRouter from "./api/project/project.js";
import companyRegisterFromTypes from './api/register/index.js';
import { connectToDb } from './config/mongodb.js';

const argv = yargs(hideBin(process.argv))
  .option('envFilePath', {
    alias: 'e',
    describe: 'Path to the .env file',
    type: 'string',
    demandOption: true,
  })
  .option('mode', {
    alias: 'm',
    describe: 'Application mode (e.g., development, production)',
    type: 'string'
  })
  .parse();

if (!argv.envFilePath || !argv.mode) {
  console.error('Missing envPath or mode. Exiting...');
  process.exit(1);
}

dotenv.config({ path: argv.envFilePath });

if (!argv.mode) {
  console.error("Error: Missing 'mode' argument.");
  process.exit(1);
}

if (!['dev', 'stg', 'prod'].includes(argv.mode)) {
  console.error("Error: Invalid mode passed. Choose 'dev', 'stg', or 'prod'.");
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
const app = express();

const allowedOrigins = {
  dev: '*',
  stg: '*',
  prod: process.env.PROD_CORS_ORIGIN,
};

app.use(
  cors({
    origin: allowedOrigins[argv.mode],
  }),
);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  logger.info(`Request to ${req.path}`);
  next();
});

const swaggerOptions = {
  definition: {
    info: {
      title: 'Broker Management API',
      version: '0.0.1',
      description: 'API documentation for the Broker Management system',
    },
  },
  apis: ['./src/api/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', healthRoutes);

app.use('/api/register', companyRegisterFromTypes);
app.use('/api/projects', projectRegisterRouter)

app.use('/api/otp' , otpRouter)

app.listen(PORT, async () => {
  await connectToDb();
  logger.info(`Server started on port ${PORT} in ${argv.mode} mode`);

  console.info(
    `\x1b[32m✅ SUCCESS:\x1b[0m Server running on: \x1b[4;36mhttp://localhost:${PORT}/api-docs\x1b[0m`,
  );
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
});
