import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/user.model.js";

const email = (process.argv[2] || "").trim().toLowerCase();
const role = (process.argv[3] || "").trim();

if (!email || !role) {
  console.error("Usage: node scripts/setUserRole.js <email> <role>");
  process.exit(1);
}

const allowedRoles = new Set(["user", "owner", "deliveryBoy"]);
if (!allowedRoles.has(role)) {
  console.error(
    `Invalid role: ${role}. Allowed: ${Array.from(allowedRoles).join(", ")}`,
  );
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URL);

const user = await User.findOne({ email }).select("email role mobile fullName");
if (!user) {
  console.error("User not found");
  await mongoose.disconnect();
  process.exit(1);
}

const fromRole = user.role;
user.role = role;
await user.save();

console.log(
  JSON.stringify(
    {
      ok: true,
      email: user.email,
      fromRole,
      toRole: user.role,
      fullName: user.fullName,
      mobile: user.mobile,
    },
    null,
    2,
  ),
);

await mongoose.disconnect();
