// routes/authRoutes.js
import express from "express";
import { login, signup, forgotPassword, resetPassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword); 
router.post("/resetPassword", resetPassword);

export default router;
