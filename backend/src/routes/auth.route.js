import { Router } from "express";
import { register, login, me, googleLogin, updateUser } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.post("/google", googleLogin);
router.patch("/me", protect, updateUser);

export default router;
