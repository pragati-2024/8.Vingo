import path from "path";
import fs from "fs";

let cloudinaryV2 = null;
try {
  // Optional dependency (enabled when CLOUDINARY_* env vars are set)
  // eslint-disable-next-line import/no-extraneous-dependencies
  const mod = await import("cloudinary");
  cloudinaryV2 = mod?.v2 || null;
} catch {
  cloudinaryV2 = null;
}

const hasCloudinaryConfig = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  return Boolean(name && key && secret);
};

const configureCloudinary = () => {
  if (!cloudinaryV2) return false;
  if (!hasCloudinaryConfig()) return false;
  cloudinaryV2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return true;
};

const unlinkIfExists = (filePath) => {
  try {
    fs.unlinkSync(filePath);
  } catch {
    // ignore
  }
};

// Uploads an image and returns a URL/path to store in MongoDB.
// - If Cloudinary is configured, returns a stable https URL.
// - Otherwise, falls back to serving the multer file from /public.
const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return "";

  // Prefer Cloudinary in production when configured.
  if (cloudinaryV2 && configureCloudinary()) {
    try {
      const res = await cloudinaryV2.uploader.upload(localFilePath, {
        folder: process.env.CLOUDINARY_FOLDER || "vingo",
        resource_type: "image",
      });
      // Clean up local file after successful upload.
      unlinkIfExists(localFilePath);
      return res?.secure_url || res?.url || "";
    } catch {
      // If Cloudinary upload fails, fall back to /public.
    }
  }

  // Multer saves into ./public; expose as /public/<filename>
  const fileName = path.basename(localFilePath);
  return `/public/${fileName}`;
};

export default uploadOnCloudinary;
