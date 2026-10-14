import { Router } from "express";
import { register, login, me, googleLogin, updateUser, searchUser } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// register route
router.post("/register", register);

// login route
router.post("/login", login);

// get user info route
router.get("/me", protect, me);

// OAuth route
router.post("/google", googleLogin);

// update user info route
router.patch("/me", protect, updateUser);

// search user route
router.get("/search/:username", protect, searchUser);

export default router;
