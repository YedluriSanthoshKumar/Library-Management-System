import express from 'express';
import {
  getIssues,
  getIssueById,
  createIssue,
  returnBook,
} from '../controllers/issueController.js';

const router = express.Router();

router.route('/')
  .get(getIssues)
  .post(createIssue);

router.route('/:id')
  .get(getIssueById);

router.route('/:id/return')
  .put(returnBook);

export default router;
