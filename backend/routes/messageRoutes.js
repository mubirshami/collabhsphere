import express from 'express';
import { getMessages, createMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/:projectId', getMessages);
router.post('/', createMessage);

export default router;

