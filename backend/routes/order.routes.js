import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  acceptOrder,
  getCurrentOrder,
  getAssignedOrdersForDelivery,
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
orderRouter.post("/retry-broadcast", isAuth, retryBroadcast);

// Order Status
orderRouter.put("/status/:orderId/:shopId", isAuth, updateOrderStatus);
orderRouter.post("/assign-manual", isAuth, manualAssign);

// Delivery Boy Assignments
orderRouter.get("/available", isAuth, getAvailableOrders);
orderRouter.post("/accept", isAuth, acceptOrder);
orderRouter.get("/current/delivery", isAuth, getCurrentOrder);
orderRouter.get("/assigned/delivery", isAuth, getAssignedOrdersForDelivery);
orderRouter.post("/send-otp", isAuth, sendDeliveryOtp);
orderRouter.post("/verify-otp", isAuth, verifyDeliveryOtp);

// Stats
orderRouter.get("/today-deliveries", isAuth, getTodayDeliveries);

// IMPORTANT: Keep this last so it doesn't shadow named routes like /available
orderRouter.get("/:id", isAuth, getOrderById);

export default orderRouter;
