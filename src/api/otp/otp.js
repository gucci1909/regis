import express from 'express';
import apiLimiter from '../../middleware/rateLimiter.js';
import { getDb } from '../../config/mongodb.js';
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
  .option('mode', {
    alias: 'm',
    describe: 'Application mode (e.g., development, production)',
    type: 'string',
  })
  .parse();

dotenv.config({ path: argv.envFilePath });

const router = express.Router();

router.use(apiLimiter);

// utils/generateOtp.js
export function generateOtp() {
  console.log({ g: argv.mode });
  if (argv.mode === 'dev') {
    return '123456';
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res.status(400).json({ error: 'Email and phone are required' });
    }

    const db = getDb();
    const collection = db.collection('otp-verifications');

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Remove previous OTPs for this user
    await collection.deleteMany({ email });

    // Save OTP to DB
    await collection.insertOne({
      email,
      phone,
      otp,
      expiresAt,
      verified: false,
      createdAt: new Date(),
    });

    // Simulate sending OTP
    console.log(`Sending OTP ${otp} to ${email} / ${phone}`);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const db = getDb();
    const collection = db.collection('otp-verifications');

    const record = await collection.findOne({ email, otp });

    if (!record) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (record.verified) {
      return res.status(400).json({ error: 'OTP already used' });
    }

    if (new Date(record.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    await collection.updateOne({ _id: record._id }, { $set: { verified: true } });

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
