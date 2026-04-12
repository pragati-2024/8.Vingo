const rawServerUrl =
  import.meta.env.VITE_SERVER_URL ||
  import.meta.env.VITE_BASE_URL ||
  "http://localhost:8001";

export const serverUrl = String(rawServerUrl).replace(/\/+$/, "");

export const resolveMediaUrl = (maybeUrl) => {
  if (!maybeUrl) return maybeUrl;
  if (typeof maybeUrl !== "string") return maybeUrl;
  const url = maybeUrl.trim();
  if (!url) return url;
  // Already-resolved URL types
  if (/^(data:|blob:)/i.test(url)) return url;
  if (/^https?:\/\//i.test(url)) return url;
  // Encode spaces etc. to avoid 404s when multer keeps original names.
  const encodedPath = encodeURI(url);
  if (url.startsWith("/")) return `${serverUrl}${encodedPath}`;
  return `${serverUrl}/${encodedPath}`;
};
