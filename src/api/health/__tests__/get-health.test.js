import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import healthRoutes from '../health.js';

jest.mock('../../../middleware/rateLimiter.js', () => (req, res, next) => next());

const app = express();
app.use(express.json());
app.use('/api', healthRoutes);

describe('GET /api/health', () => {
  it('should return 200 and status OK', async () => {
    const res = await request(app).get('/api/health');
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'OK' });
  });
});
