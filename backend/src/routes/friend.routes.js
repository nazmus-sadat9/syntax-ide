import express from "express";
import { protect } from "../middleware/auth.middleware.js"; // use your real path
import { sendRequest, acceptRequest, rejectRequest } from "../controllers/friend.controller.js";

const router = express.Router();
router.post("/request", protect, sendRequest);
router.post("/accept", protect, acceptRequest);
router.post("/reject", protect, rejectRequest);
export default router;
