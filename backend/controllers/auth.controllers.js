import User from "../models/user.model.js";
import { randomInt } from "crypto";
import bcrypt, { hash } from "bcryptjs";
import genToken from "../utils/token.js";
import { sendEmailVerificationOtpMail, sendOtpMail } from "../utils/mail.js";

const buildAuthCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };
};

export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role } = req.body;

    if (!fullName || !email || !password || !mobile || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedMobile = String(mobile).trim();
    const normalizedPassword = String(password).trim();

    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return res.status(400).json({ message: "User Already exist." });
    }
    if (normalizedPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "password must be at least 6 characters." });
    }
    if (normalizedMobile.length < 10) {
      return res
        .status(400)
        .json({ message: "mobile no must be at least 10 digits." });
    }

    const hashedPassword = await bcrypt.hash(normalizedPassword, 10);
    user = await User.create({
      fullName,
      email: normalizedEmail,
      role,
      mobile: normalizedMobile,
      password: hashedPassword,
    });

    const token = await genToken(user._id);
    res.cookie("token", token, buildAuthCookieOptions());

    const safeUser = user.toObject();
    delete safeUser.password;
    return res.status(201).json({ ...safeUser, token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `sign up error ${error?.message || error}` });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const passwordRaw = String(password);
    const passwordTrimmed = passwordRaw.trim();
    const passwordCandidates = [passwordRaw];
    if (passwordTrimmed !== passwordRaw)
      passwordCandidates.push(passwordTrimmed);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }

    if (!user.password) {
      return res.status(400).json({
        message:
          "This account does not have a password. Use Google Sign-In or reset password.",
      });
    }

    const storedPassword = user.password;
    const looksLikeBcryptHash =
      typeof storedPassword === "string" && storedPassword.startsWith("$2");

    let isMatch = false;

    if (looksLikeBcryptHash) {
      for (const candidate of passwordCandidates) {
        // eslint-disable-next-line no-await-in-loop
        if (await bcrypt.compare(candidate, storedPassword)) {
          isMatch = true;
          break;
        }
      }
    } else {
      // Legacy/invalid storage: if it matches exactly, migrate to bcrypt.
      for (const candidate of passwordCandidates) {
        if (String(storedPassword) === candidate) {
          const hashedPassword = await bcrypt.hash(candidate, 10);
          user.password = hashedPassword;
          await user.save();
          isMatch = true;
          break;
        }
      }
    }

    if (!isMatch) {
      return res.status(400).json({ message: "incorrect Password" });
    }

    const token = await genToken(user._id);
    res.cookie("token", token, buildAuthCookieOptions());

    const safeUser = user.toObject();
    delete safeUser.password;
    return res.status(200).json({ ...safeUser, token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `sign In error ${error?.message || error}` });
  }
};

export const signOut = async (req, res) => {
  try {
    res.clearCookie("token", buildAuthCookieOptions());
    return res.status(200).json({ message: "log out successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `sign out error ${error?.message || error}` });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;
    await user.save();
    await sendOtpMail(normalizedEmail, otp);

    const payload = { message: "otp sent successfully" };
    if (process.env.NODE_ENV !== "production") {
      payload.devOtp = otp;
    }

    return res.status(200).json(payload);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `send otp error ${error?.message || error}` });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "email and otp are required" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || user.resetOtp != otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "invalid/expired otp" });
    }
    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    await user.save();
    return res.status(200).json({ message: "otp verify successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `verify otp error ${error?.message || error}` });
  }
};

export const sendEmailVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }

    if (user.isVerified) {
      return res.status(200).json({ message: "email already verified" });
    }

    const otp = String(randomInt(0, 1_000_000)).padStart(6, "0");
    user.emailVerificationOtp = otp;
    user.emailVerificationOtpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendEmailVerificationOtpMail(normalizedEmail, otp);

    const payload = { message: "verification otp sent successfully" };
    if (process.env.NODE_ENV !== "production") {
      payload.devOtp = otp;
    }

    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({
      message: `send email verification otp error ${error?.message || error}`,
    });
  }
};

export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "email and otp are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanedOtp = String(otp).trim();

    if (!/^\d{6}$/.test(cleanedOtp)) {
      return res.status(400).json({ message: "invalid/expired otp" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }

    if (user.isVerified) {
      return res.status(200).json({ message: "email already verified" });
    }

    if (
      !user.emailVerificationOtp ||
      !user.emailVerificationOtpExpires ||
      user.emailVerificationOtp != cleanedOtp ||
      user.emailVerificationOtpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "invalid/expired otp" });
    }

    user.isVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationOtpExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "email verified successfully" });
  } catch (error) {
    return res.status(500).json({
      message: `verify email otp error ${error?.message || error}`,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: "email and newPassword are required" });
    }
    const normalizedNewPassword = String(newPassword).trim();
    if (normalizedNewPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "password must be at least 6 characters." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "otp verification required" });
    }
    const hashedPassword = await bcrypt.hash(normalizedNewPassword, 10);
    user.password = hashedPassword;
    user.isOtpVerified = false;
    await user.save();
    return res.status(200).json({ message: "password reset successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `reset password error ${error?.message || error}` });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { fullName, email, mobile, role } = req.body;
    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      if (!fullName || !mobile || !role) {
        return res.status(400).json({
          message:
            "Account not found. Please Sign Up with Google (mobile + role required).",
        });
      }
      user = await User.create({
        fullName,
        email: normalizedEmail,
        mobile: String(mobile).trim(),
        role,
      });
    }

    const token = await genToken(user._id);
    res.cookie("token", token, {
      ...buildAuthCookieOptions(),
    });

    const safeUser = user.toObject();
    delete safeUser.password;
    return res.status(200).json({ ...safeUser, token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `googleAuth error ${error?.message || error}` });
  }
};
