import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/user.model.js";

const email = (process.argv[2] || "").trim().toLowerCase();
if (!email) {
  console.error("Usage: node scripts/inspectUser.js <email>");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URL);

const user = await User.findOne({ email }).select(
  "email role mobile password isOtpVerified resetOtp otpExpires",
);

const password = user?.password;
const passwordLooksBcrypt =
  typeof password === "string" && password.startsWith("$2");

console.log(
  JSON.stringify(
    {
      found: !!user,
      email: user?.email,
      role: user?.role,
      hasMobile: !!user?.mobile,
      mobileLen: user?.mobile?.length,
      hasPassword: !!password,
      passwordLen: typeof password === "string" ? password.length : null,
      passwordLooksBcrypt,
      otp: {
        isOtpVerified: !!user?.isOtpVerified,
        hasResetOtp: !!user?.resetOtp,
        otpExpires: user?.otpExpires || null,
      },
    },
    null,
    2,
  ),
);

await mongoose.disconnect();
