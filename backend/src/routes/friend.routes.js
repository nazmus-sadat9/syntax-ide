import express from "express";
import { protect } from "../middleware/auth.js";
import { sendRequest, acceptRequest, rejectRequest } from "../controllers/friendship.controller.js";

const router = express.Router();

// friend request route
router.post("/request", protect, sendRequest);

//friend request accept route
router.post("/accept", protect, acceptRequest);

// friend request reject route
router.post("/reject", protect, rejectRequest);

// export the app
export default router;
