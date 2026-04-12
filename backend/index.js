import http from "http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

import connectDb from "./config/db.js";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import shopRouter from "./routes/shop.routes.js";
import itemRouter from "./routes/item.routes.js";
import orderRouter from "./routes/order.routes.js";

import User from "./models/user.model.js";
import { Server as SocketIOServer } from "socket.io";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: (origin, callback) => {
    // allow non-browser clients (e.g. curl, Postman)
    if (!origin) return callback(null, true);

    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(origin);
    if (isLocalhost) return callback(null, true);

    if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/public", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Vingo API running" });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

// Central error handler (keeps CORS errors readable)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err?.message || "Internal server error" });
});

// Default to 8001 to match `backend/.env.example` and the frontend dev config.
const PORT = Number(process.env.PORT) || 8001;

// Socket.IO setup
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: corsOptions,
});
app.set("io", io);

io.on("connection", (socket) => {
  const getCookieValue = (cookieHeader, name) => {
    if (!cookieHeader) return null;
    const parts = String(cookieHeader).split(";");
    for (const part of parts) {
      const [rawKey, ...rest] = part.trim().split("=");
      if (!rawKey) continue;
      const key = rawKey.trim();
      if (key !== name) continue;
      return decodeURIComponent(rest.join("=") || "");
    }
    return null;
  };

  const identifySocketUser = async (userId) => {
    if (!userId) return;
    socket.data.userId = String(userId);
    socket.join(String(userId));
    try {
      const updated = await User.findByIdAndUpdate(
        userId,
        {
          socketId: socket.id,
          isOnline: true,
        },
        { new: true },
      ).select("role");

      if (updated?.role === "deliveryBoy") {
        socket.join("role:deliveryBoy");
      } else if (updated?.role === "owner") {
        socket.join("role:owner");
      } else if (updated?.role === "user") {
        socket.join("role:user");
      }
    } catch (e) {
      console.error("Socket identity update failed:", e);
    }
  };

  // Best-effort: auto-identify via JWT cookie so rooms/online status work
  // even if the frontend doesn't emit the custom `identity` event.
  try {
    const token = getCookieValue(socket.request?.headers?.cookie, "token");
    if (token && process.env.JWT_SECRET) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded?.userId) {
        identifySocketUser(decoded.userId);
      }
    }
  } catch (e) {
    // Ignore invalid/expired tokens for socket connections.
  }

  socket.on("identity", async ({ userId } = {}) => {
    identifySocketUser(userId);
  });

  socket.on("joinOrder", (orderId) => {
    if (!orderId) return;
    socket.join(`order:${String(orderId)}`);
  });

  socket.on("leaveOrder", (orderId) => {
    if (!orderId) return;
    socket.leave(`order:${String(orderId)}`);
  });

  socket.on(
    "updateLocation",
    async ({ latitude, longitude, userId, orderId } = {}) => {
      const lat = Number(latitude);
      const lon = Number(longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

      // Persist latest location for the delivery boy (best-effort)
      if (userId) {
        try {
          await User.findByIdAndUpdate(userId, {
            location: { type: "Point", coordinates: [lon, lat] },
          });
        } catch (e) {
          console.error("Location update failed:", e);
        }
      }

      // Broadcast to order room for live tracking
      if (orderId) {
        io.to(`order:${String(orderId)}`).emit("deliveryLocationUpdate", {
          orderId: String(orderId),
          latitude: lat,
          longitude: lon,
          userId: userId ? String(userId) : undefined,
        });
      }
    },
  );

  socket.on("disconnect", async () => {
    try {
      await User.findOneAndUpdate(
        { socketId: socket.id },
        { socketId: null, isOnline: false },
      );
    } catch (e) {
      console.error("Socket disconnect update failed:", e);
    }
  });
});

await connectDb();

let listenAttempts = 0;
const MAX_LISTEN_ATTEMPTS = 180; // ~3 minutes
let retryTimer = null;
let isStartingListen = false;

const scheduleRetry = () => {
  if (retryTimer) return;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    startListening();
  }, 1000);
};

const startListening = () => {
  if (server.listening || isStartingListen) return;
  isStartingListen = true;
  server.listen(PORT);
};

server.on("listening", () => {
  isStartingListen = false;
  listenAttempts = 0;
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  console.log(`Backend listening on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  isStartingListen = false;
  if (err?.code === "EADDRINUSE") {
    listenAttempts += 1;
    if (listenAttempts <= MAX_LISTEN_ATTEMPTS) {
      console.error(
        `Port ${PORT} is busy (EADDRINUSE). Retrying... (${listenAttempts}/${MAX_LISTEN_ATTEMPTS})`,
      );
      scheduleRetry();
      return;
    }

    console.error(
      `Port ${PORT} is still in use after retries. Stop the other process or set PORT to a different value.`,
    );
    process.exit(1);
  }

  console.error("Server error:", err);
  process.exit(1);
});

startListening();
