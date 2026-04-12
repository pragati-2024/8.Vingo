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

// ================= CORS CONFIG (FINAL) =================
const allowedOrigins = new Set(
  [
    process.env.CLIENT_URL,
    ...(process.env.CLIENT_URLS
      ? process.env.CLIENT_URLS.split(",")
      : []),
  ]
    .filter(Boolean)
    .map((o) => o.trim().replace(/\/+$/, ""))
);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow Postman / server-to-server
      if (!origin) return callback(null, true);

      const normalized = origin.trim().replace(/\/+$/, "");

      // allow localhost automatically
      if (/^http:\/\/localhost:\d+$/.test(normalized)) {
        return callback(null, true);
      }

      // allow Vercel / production origins from env
      if (allowedOrigins.has(normalized)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${normalized}`));
    },
    credentials: true,
  })
);

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
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const normalized = origin.trim().replace(/\/+$/, "");

      if (/^http:\/\/localhost:\d+$/.test(normalized)) {
        return callback(null, true);
      }

      if (allowedOrigins.has(normalized)) {
        return callback(null, true);
      }

      return callback(new Error("Socket CORS blocked"));
    },
    credentials: true,
  },
});

app.set("io", io);

// ================= SOCKET =================
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// ================= DB + START =================
await connectDb();

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});