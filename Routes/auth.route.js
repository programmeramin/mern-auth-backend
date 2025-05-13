import express from "express";
import { checkAuth, forgotPassword, login, logout, resetPassword, signup, verifyEmail } from "../Controllers/auth.controllers.js";
import { verifyToken } from "../Middleware/verifyToken.js";


// init router
const router = express.Router();

// check auth token verify
router.get("/check-auth", verifyToken, checkAuth );

// routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
    

export default router;