import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "..", "public");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      fs.mkdirSync(publicDir, { recursive: true });
    } catch (e) {
      // ignore; multer will surface write errors if any
    }
    cb(null, publicDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const baseName = path
      .basename(file.originalname || "file", ext)
      .replace(/[^a-zA-Z0-9._-]+/g, "_");
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${ext}`;
    cb(null, unique);
  },
});

export const upload = multer({ storage });
