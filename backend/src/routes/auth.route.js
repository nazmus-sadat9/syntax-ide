import { Router } from "express";
import { register, verifyEmail, resendCode, login, me, googleLogin, updateUser, searchUser } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// register route
router.post("/register", register);

// verify route
router.post("/verify", verifyEmail);

// resend-code for verify route
router.post("/resend-code", resendCode);
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
