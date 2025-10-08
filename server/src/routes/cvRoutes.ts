import express from 'express';
import {
  createCV,
  getCV,
  updateCV,
  deleteCV,
  getAllCVs,
  downloadCVPdf
} from '../controllers/cvController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = express.Router();

// CV routes
// All routes require authentication by default
router.post('/', authenticateToken, createCV);
router.get('/', authenticateToken, getAllCVs);
router.get('/:id', authenticateToken, getCV);
router.put('/:id', authenticateToken, updateCV);
router.delete('/:id', authenticateToken, deleteCV);
// PDF download route
router.get('/:id/download', authenticateToken, downloadCVPdf);

export default router;