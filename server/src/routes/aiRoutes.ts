import express from "express";
import {
  generateCV,
  optimizeCV,
  getCVSuggestions,
} from "../controllers/aiController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// AI routes
router.post("/generate", generateCV); // Tạo CV bằng AI (không bắt buộc auth)
router.post("/optimize", authenticateToken, optimizeCV); // Tối ưu hóa CV
router.get("/suggestions/:cvId", authenticateToken, getCVSuggestions); // Gợi ý cải thiện CV

export default router;



