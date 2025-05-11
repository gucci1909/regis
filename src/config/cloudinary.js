import { v2 as cloudinary } from 'cloudinary';
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

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export default cloudinary;
