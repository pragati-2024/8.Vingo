import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

const email = (process.argv[2] || "").trim().toLowerCase();
const newPassword = String(process.argv[3] || "");

if (!email || !newPassword) {
  console.error("Usage: node scripts/setUserPassword.js <email> <newPassword>");
  process.exit(1);
}

if (newPassword.trim().length < 6) {
  console.error("Password must be at least 6 characters.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URL);

const user = await User.findOne({ email }).select(
  "email role mobile fullName password resetOtp otpExpires isOtpVerified",
);
if (!user) {
  console.error("User not found");
  await mongoose.disconnect();
  process.exit(1);
}

user.password = await bcrypt.hash(newPassword.trim(), 10);
user.resetOtp = undefined;
user.otpExpires = undefined;
user.isOtpVerified = false;

await user.save();

console.log(
  JSON.stringify(
    {
      ok: true,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      mobile: user.mobile,
      passwordUpdated: true,
    },
    null,
    2,
  ),
);

await mongoose.disconnect();
