import dotenv from "dotenv";
import mongoose from "mongoose";

import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";

dotenv.config();

const usage = () => {
  console.log(
    [
      "Usage:",
      "  node scripts/inspectLatestOrders.js --limit 10",
      "  node scripts/inspectLatestOrders.js --ownerEmail owner@example.com",
      "  node scripts/inspectLatestOrders.js --userEmail user@example.com",
    ].join("\n"),
  );
};

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return args[idx + 1];
};

const limit = Number(getArg("limit") || 10);
const ownerEmail = getArg("ownerEmail");
const userEmail = getArg("userEmail");

const main = async () => {
  const uri = process.env.MONGODB_URL;
  if (!uri) {
    console.error("MONGODB_URL is not set");
    process.exit(1);
  }

  await mongoose.connect(uri);

  let owner = null;
  if (ownerEmail) {
    owner = await User.findOne({ email: ownerEmail }).select("_id email role");
    if (!owner) {
      console.error("Owner not found for email:", ownerEmail);
      process.exit(1);
    }
  }

  let user = null;
  if (userEmail) {
    user = await User.findOne({ email: userEmail }).select("_id email role");
    if (!user) {
      console.error("User not found for email:", userEmail);
      process.exit(1);
    }
  }

  if (owner && owner.role !== "owner") {
    console.warn("Warning: ownerEmail role is not owner:", owner.role);
  }
  if (user && user.role !== "user") {
    console.warn("Warning: userEmail role is not user:", user.role);
  }

  let query = {};
  if (user?._id) query.user = user._id;

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .limit(Number.isFinite(limit) ? limit : 10)
    .populate("user", "email role fullName")
    .populate("shopOrders.shop", "name owner city")
    .populate("shopOrders.owner", "email role")
    .populate("deliveryBoy", "email role");

  console.log("Found orders:", orders.length);

  let ownerShopIds = null;
  if (owner?._id) {
    const shops = await Shop.find({ owner: owner._id }).select("_id name city");
    ownerShopIds = new Set(shops.map((s) => String(s._id)));
    console.log(
      `Owner shops (${shops.length}):`,
      shops.map((s) => `${s.name} (${s.city}) ${s._id}`).join(" | ") ||
        "(none)",
    );
  }

  for (const o of orders) {
    console.log("\n---");
    console.log("order:", String(o._id));
    console.log("createdAt:", o.createdAt?.toISOString?.() || o.createdAt);
    console.log("user:", o.user?.email, "role:", o.user?.role);
    console.log("paymentMethod:", o.paymentMethod, "payment:", o.payment);
    console.log(
      "deliveryBoy:",
      o.deliveryBoy?._id ? o.deliveryBoy.email : null,
    );

    for (const so of o.shopOrders || []) {
      const shopId = so.shop?._id
        ? String(so.shop._id)
        : so.shop
          ? String(so.shop)
          : null;
      const embeddedOwnerId = so.owner?._id
        ? String(so.owner._id)
        : so.owner
          ? String(so.owner)
          : null;
      const shopOwnerId = so.shop?.owner ? String(so.shop.owner) : null;

      console.log("  shopOrder:");
      console.log("    shop:", so.shop?.name || null, shopId);
      console.log("    shop.city:", so.shop?.city || null);
      console.log("    shop.owner:", shopOwnerId);
      console.log("    embedded owner:", embeddedOwnerId);
      console.log("    status:", so.status);
      console.log(
        "    items:",
        (so.shopOrderItems || [])
          .map((i) => `${i.name} x${i.quantity}`)
          .join(", "),
      );

      if (ownerShopIds && shopId) {
        console.log("    belongsToOwnerEmail?:", ownerShopIds.has(shopId));
      }
    }
  }

  await mongoose.disconnect();
};

if (args.includes("--help")) {
  usage();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
