import dotenv from "dotenv";
import connectDb from "../config/db.js";
import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import { searchImageUrl } from "../utils/imageSearch.js";

dotenv.config();

const shouldUpdateImage = (image) => {
  if (!image) return true;
  if (typeof image !== "string") return false;
  const v = image.trim().toLowerCase();
  if (!v) return true;
  if (v.startsWith("data:image/svg")) return true;
  if (v.includes("pexels.com")) return true;
  // Upgrade our seeded placeholder assets too
  if (v.includes("/public/placeholder-")) return true;
  if (v.includes("/public/placeholder-image")) return true;
  return false;
};

const compact = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

const refreshItems = async ({ dryRun }) => {
  const cursor = Item.find({}).cursor();
  let scanned = 0;
  let updated = 0;

  for await (const item of cursor) {
    scanned += 1;
    if (!shouldUpdateImage(item.image)) continue;

    const query = compact(
      `${item.name || ""} ${item.category || ""} ${item.foodType || ""} food`,
    );
    if (!query) continue;

    const url = await searchImageUrl(query, { perPage: 10 });
    if (!url) continue;

    if (!dryRun) {
      item.image = url;
      await item.save();
    }
    updated += 1;

    if (updated % 10 === 0) {
      console.log(`[items] updated ${updated} (scanned ${scanned})`);
    }
  }

  console.log(
    `[items] done. scanned=${scanned} updated=${updated} dryRun=${dryRun}`,
  );
};

const refreshShops = async ({ dryRun }) => {
  const cursor = Shop.find({}).cursor();
  let scanned = 0;
  let updated = 0;

  for await (const shop of cursor) {
    scanned += 1;
    if (!shouldUpdateImage(shop.image)) continue;

    const query = compact(`${shop.name || ""} ${shop.city || ""} restaurant`);
    if (!query) continue;

    const url = await searchImageUrl(query, { perPage: 10 });
    if (!url) continue;

    if (!dryRun) {
      shop.image = url;
      await shop.save();
    }
    updated += 1;

    if (updated % 10 === 0) {
      console.log(`[shops] updated ${updated} (scanned ${scanned})`);
    }
  }

  console.log(
    `[shops] done. scanned=${scanned} updated=${updated} dryRun=${dryRun}`,
  );
};

const main = async () => {
  const dryRun = process.argv.includes("--dry-run");

  if (!process.env.PEXELS_API_KEY) {
    console.error("Missing PEXELS_API_KEY in backend/.env");
    process.exit(1);
  }

  await connectDb();

  await refreshShops({ dryRun });
  await refreshItems({ dryRun });

  process.exit(0);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
