import express from 'express';
import {
  createCV,
  getCV,
  updateCV,
  deleteCV,
  getAllCVs
} from '../controllers/cvController';
import { downloadCVPdf } from '../controllers/cvController';

const router = express.Router();

// CV routes
router.post('/', createCV);
router.get('/', getAllCVs);
router.get('/:id', getCV);
router.put('/:id', updateCV);
router.delete('/:id', deleteCV);
// PDF download route
router.get('/:id/download', downloadCVPdf);

export default router;