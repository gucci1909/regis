import { MongoClient } from 'mongodb';
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

const client = new MongoClient(process.env.MONGO_URI);
let db;

export async function connectToDb() {
  await client.connect();
  db = client.db();
  console.log('MongoDB connected');
}

export function getDb() {
  if (!db) throw new Error('Call connectToDb first');
  return db;
}
