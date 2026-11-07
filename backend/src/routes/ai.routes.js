import express from "express";
import { chat } from "../controllers/ai.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/chat", protect, chat);

export default router;
