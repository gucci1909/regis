import express from 'express';
import apiLimiter from '../../middleware/rateLimiter.js';
import { upload } from '../../utils/multer.js';
import { getDb } from '../../config/mongodb.js';
import validator from 'validator';
import { uploadFile } from '../../helpers/uploadPdf/uploadFile.js';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.use(apiLimiter);

/**
 * @swagger
 * tags:
 *   name: Domestic Company
 *   description: Domestic company registration endpoints
 */

/**
 * @swagger
 * /api/register/company/domestic-company:
 *   post:
 *     tags: [Domestic Company]
 *     summary: Register a domestic company
 *     description: Endpoint for domestic company registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               location:
 *                 type: string
 *               authorizedPerson:
 *                 type: string
 *               position:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *             required:
 *               - companyName
 *               - location
 *               - authorizedPerson
 *               - email
 *               - phone
 *     responses:
 *       201:
 *         description: Company registered successfully
 *       400:
 *         description: Invalid input data
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Internal server error
 */
router.post(
  '/international-company',
  upload.fields([
    { name: 'visaUpload', maxCount: 1 },
    { name: 'passportUpload', maxCount: 1 },
    { name: 'incorporationCertificateUpload', maxCount: 1 },
    { name: 'vatCertificateUpload', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Ensure the necessary fields are present
      const { companyName, authorizedPerson, email, phone } = req.body;

      if (!companyName || !authorizedPerson || !email || !phone) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate email format
      if (!validator.isEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // // Validate phone number
      // if (!validator.isMobilePhone(phone)) {
      //   return res.status(400).json({ error: 'Invalid phone number' });
      // }

      // Process file uploads
      const uploadPromises = [];
      const fileFields = [
        'visaUpload',
        'passportUpload',
        'incorporationCertificateUpload',
        'vatCertificateUpload',
      ];

      for (const field of fileFields) {
        if (req.files?.[field]) {
          uploadPromises.push(uploadFile(req.files[field]));
        } else {
          uploadPromises.push(Promise.resolve(null));
        }
      }

      const [visaUpload, passportUpload, incorporationCertificateUpload, vatCertificateUpload] =
        await Promise.all(uploadPromises);

      // Save company data to MongoDB
      const db = getDb();
      const collection = db.collection('request-international-companies');

      const { newBankName, password, confirmPassword, ...rest } = req.body;

      // Hash the password using bcryptjs
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const result = await collection.insertOne({
        ...rest,
        password: hashedPassword,
        visaUpload,
        passportUpload,
        incorporationCertificateUpload,
        vatCertificateUpload,
        approved: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      res.status(201).json({
        message: 'International-Company Registration Request Sent Successfully',
        companyId: result.insertedId,
      });
    } catch (error) {
      console.error('Registration error:', error);

      // Handle specific error types
      if (error.name === 'MongoError' && error.code === 11000) {
        return res.status(400).json({ error: 'Company already registered' });
      }

      res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },
);

router.get('/international-company', async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection('request-international-companies');

    const pendingCompanies = await collection.find({ approved: 'pending' }).toArray();

    res.status(200).json(pendingCompanies);
  } catch (error) {
    console.error('Error fetching unapproved companies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/international-company/status-change', async (req, res) => {
  try {
    const { company_id, register_status } = req.body;

    if (!company_id) {
      return res.status(400).json({ error: 'Missing companyId' });
    }

    const db = getDb();
    const collection = db.collection('request-international-companies');

    const result = await collection.updateOne(
      { _id: new ObjectId(company_id) },
      { $set: { approved: register_status, updatedAt: new Date() } },
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Company not found or already approved' });
    }

    res
      .status(200)
      .json({ message: `Company ${register_status ? 'approved' : 'rejected'} successfully` });
  } catch (error) {
    console.error('Error approving company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
