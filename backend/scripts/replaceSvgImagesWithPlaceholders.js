import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import connectDb from "../config/db.js";
import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendDir = path.resolve(__dirname, "..");
const rootDir = path.resolve(backendDir, "..");

const frontendAssetsDir = path.join(rootDir, "frontend", "src", "assets");
const backendPublicDir = path.join(backendDir, "public");

const SOURCE_ASSETS = ["image4.avif", "image8.avif", "image10.avif"];

const ensureAndCopyPlaceholders = () => {
  fs.mkdirSync(backendPublicDir, { recursive: true });

  const publicPaths = [];

  for (const fileName of SOURCE_ASSETS) {
    const src = path.join(frontendAssetsDir, fileName);
    if (!fs.existsSync(src)) {
      throw new Error(`Missing placeholder asset: ${src}`);
    }

    const destFile = `placeholder-${fileName}`;
    const dest = path.join(backendPublicDir, destFile);
    fs.copyFileSync(src, dest);
    publicPaths.push(`/public/${destFile}`);
  }

  return publicPaths;
};

const isSvgDataUri = (value) =>
  typeof value === "string" && value.trim().toLowerCase().startsWith("data:");

const replaceForModel = async (Model, publicPaths) => {
  const docs = await Model.find({
    image: { $type: "string", $regex: /^data:/i },
  }).select("_id image");

  if (!docs.length) return { matched: 0, updated: 0 };

  let idx = 0;
  let updated = 0;

  for (const doc of docs) {
    if (!isSvgDataUri(doc.image)) continue;
    const nextImage = publicPaths[idx % publicPaths.length];
    idx += 1;

    await Model.updateOne({ _id: doc._id }, { $set: { image: nextImage } });
    updated += 1;
  }

  return { matched: docs.length, updated };
};

const main = async () => {
  const publicPaths = ensureAndCopyPlaceholders();

  await connectDb();

  const items = await replaceForModel(Item, publicPaths);
  const shops = await replaceForModel(Shop, publicPaths);

  console.log("Done.");
  console.log("Item image replace:", items);
  console.log("Shop image replace:", shops);
  console.log("Placeholders used:", publicPaths);

  process.exit(0);
};

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
