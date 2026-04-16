import express from "express";
import {
  googleAuth,
  resetPassword,
  sendEmailVerificationOtp,
  sendOtp,
  signIn,
  signOut,
  signUp,
  verifyEmailOtp,
  verifyOtp,
} from "../controllers/auth.controllers.js";

const authRouter = express.Router();

authRouter.post("/register", signUp);
authRouter.post("/login", signIn);
authRouter.get("/signout", signOut);
authRouter.post("/send-otp", sendOtp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/send-email-verification-otp", sendEmailVerificationOtp);
authRouter.post("/verify-email-otp", verifyEmailOtp);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/google-auth", googleAuth);

export default authRouter;
