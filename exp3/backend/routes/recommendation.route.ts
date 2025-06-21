// backend/routes/recommendation.route.ts
import express from 'express';
import { getRecommendation } from '../controllers/recommendation.controller';

const router = express.Router();
router.post('/recommend', getRecommendation);

export default router;
