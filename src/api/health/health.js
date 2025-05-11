import express from 'express';
import apiLimiter from '../../middleware/rateLimiter.js';

const router = express.Router();

router.use(apiLimiter);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check API
 *     description: Check if the API server is healthy.
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 */
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

export default router;
