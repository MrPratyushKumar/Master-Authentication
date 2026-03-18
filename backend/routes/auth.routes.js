import express from "express";
import { login, logout, signup, verifyEmail, forgotPassword,
  resetPassword , checkAuth} from "../controllers/auth.controller.js";
  import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword); 
// verifyToken runs first → then checkAuth
// Just like: security guard checks ID → then lets you into the building

router.get("/check-auth", verifyToken, checkAuth);

export default router;