import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  acceptOrder,
  getCurrentOrder,
  getMyOrders,
  getOrderById,
  placeOrder,
  sendDeliveryOtp,
  updateOrderStatus,
  verifyDeliveryOtp,
  verifyPayment,
  getTodayDeliveries,
  getAvailableOrders,
  retryBroadcast,
  manualAssign,
} from "../controllers/order.controllers.js";

const orderRouter = express.Router();

// User Orders
orderRouter.post("/place", isAuth, placeOrder);
orderRouter.post("/verify-payment", isAuth, verifyPayment);
orderRouter.get("/my-orders", isAuth, getMyOrders);
orderRouter.get("/:id", isAuth, getOrderById);
orderRouter.post("/retry-broadcast", isAuth, retryBroadcast);

// Order Status
orderRouter.put("/status/:orderId/:shopId", isAuth, updateOrderStatus);
orderRouter.post("/assign-manual", isAuth, manualAssign);

// Delivery Boy Assignments
orderRouter.get("/available", isAuth, getAvailableOrders);
orderRouter.post("/accept", isAuth, acceptOrder);
orderRouter.get("/current/delivery", isAuth, getCurrentOrder);
orderRouter.post("/send-otp", isAuth, sendDeliveryOtp);
orderRouter.post("/verify-otp", isAuth, verifyDeliveryOtp);

// Stats
orderRouter.get("/today-deliveries", isAuth, getTodayDeliveries);

export default orderRouter;
