import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";

dotenv.config();

const main = async () => {
  const uri = process.env.MONGODB_URL;
  if (!uri) {
    console.error("MONGODB_URL is not set");
    process.exit(1);
  }

  await mongoose.connect(uri);

  const owners = await User.find({ role: "owner" })
    .select("_id email fullName")
    .sort({ createdAt: -1 })
    .lean();

  console.log("Owners:", owners.length);

  for (const o of owners) {
    const shops = await Shop.find({ owner: o._id })
      .select("_id name city")
      .sort({ createdAt: -1 })
      .lean();

    console.log("\n---");
    console.log("owner:", o.email, String(o._id));
    console.log(
      "shops:",
      shops.length
        ? shops.map((s) => `${s.name} (${s.city}) ${String(s._id)}`).join(" | ")
        : "(none)",
    );
  }

  await mongoose.disconnect();
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
