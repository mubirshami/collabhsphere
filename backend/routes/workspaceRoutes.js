import express from 'express';
import {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember
} from '../controllers/workspaceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWorkspaces)
  .post(createWorkspace);

router.route('/:id')
  .get(getWorkspace)
  .put(updateWorkspace)
  .delete(deleteWorkspace);

router.post('/:id/members', addMember);

export default router;

