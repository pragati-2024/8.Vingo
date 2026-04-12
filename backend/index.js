import http from "http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import connectDb from "./config/db.js";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import shopRouter from "./routes/shop.routes.js";
import itemRouter from "./routes/item.routes.js";
import orderRouter from "./routes/order.routes.js";

import { Server as SocketIOServer } from "socket.io";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ================= CORS CONFIG =================
const normalizeOrigin = (value) =>
  String(value || "")
    .trim()
    .replace(/\/+$/, "");

const allowedOrigins = (() => {
  const raw = [
    process.env.CLIENT_URL, // single origin
    process.env.CLIENT_URLS, // comma-separated
    process.env.ALLOWED_ORIGINS, // comma-separated
  ]
    .filter(Boolean)
    .join(",");

  const list = raw
    .split(",")
    .map((s) => normalizeOrigin(s))
    .filter(Boolean);

  return new Set(list);
})();

const allowVercelApp =
  String(process.env.ALLOW_VERCEL_APP || "").toLowerCase() === "true";

const corsOrigin = (origin, callback) => {
  // allow non-browser clients (e.g. curl, Postman)
  if (!origin) return callback(null, true);

  const normalized = normalizeOrigin(origin);

  // allow localhost automatically
  if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(normalized)) {
    return callback(null, true);
  }

  if (allowedOrigins.has(normalized)) return callback(null, true);

  if (
    allowVercelApp &&
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalized)
  ) {
    return callback(null, true);
  }

  return callback(new Error(`Not allowed by CORS: ${normalized}`));
};

const corsOptions = {
  origin: corsOrigin,
  credentials: true,
};

app.use(cors(corsOptions));

// ================= STATIC ASSETS =================
// Multer saves uploads into ./public and DB stores paths like /public/<file>.
app.use("/public", express.static(path.join(__dirname, "public")));

// If a referenced /public file is missing (e.g., old local uploads), serve a placeholder.
// NOTE: Express 5 / path-to-regexp v6 does not accept a bare '/public/*' route.
// Using a mounted middleware avoids wildcard route parsing entirely.
app.use("/public", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "placeholder-image10.avif"));
});

// ================= ROUTES =================
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

// health check
app.get("/", (req, res) => {
  res.json({ message: "Vingo API running 🚀" });
});

// ================= SERVER =================
const PORT = process.env.PORT || 8001;

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: corsOptions,
});

app.set("io", io);

// ================= SOCKET =================
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Central error handler (keeps CORS errors readable)
app.use((err, req, res, next) => {
  console.error(err);
  const msg = err?.message || "Internal server error";
  if (/^Not allowed by CORS/i.test(msg)) {
    return res.status(403).json({ message: msg });
  }
  res.status(500).json({ message: msg });
});

// ================= DB + START =================
await connectDb();

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
