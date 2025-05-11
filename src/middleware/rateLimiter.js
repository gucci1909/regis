import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .option('envFilePath', {
    alias: 'e',
    describe: 'Path to the .env file',
    type: 'string',
    demandOption: true,
  })
  .parse();

dotenv.config({ path: argv.envFilePath });

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: process.env.RATE_LIMIT || 100,
  message: {
    status: 429,
    message: 'Too many requests, please try again later.',
  },
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default apiLimiter;
