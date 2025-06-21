import { Router } from 'express';
import { TranscriptController } from '../controllers/TranscriptController';

const router = Router();

router.get('/chapters/:videoId', TranscriptController.getVideoChapters);

export default router;