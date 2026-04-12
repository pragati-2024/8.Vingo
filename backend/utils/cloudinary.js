import path from "path";

// Dev-safe fallback uploader.
// If you later want real Cloudinary uploads, replace this with Cloudinary SDK logic.
// Current code expects a string URL/path to store in MongoDB.
const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return "";

  // Multer saves into ./public; expose as /public/<filename>
  const fileName = path.basename(localFilePath);
  return `/public/${fileName}`;
};

export default uploadOnCloudinary;
