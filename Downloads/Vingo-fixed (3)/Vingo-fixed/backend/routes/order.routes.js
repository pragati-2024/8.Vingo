import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { 
    acceptOrder, 
    getCurrentOrder, 
    getDeliveryBoyAssignment, 
    getMyOrders, 
    getOrderById, 
    placeOrder, 
    sendDeliveryOtp, 
    updateOrderStatus, 
    verifyDeliveryOtp, 
    verifyPayment,
    getTodayDeliveries,
    markDelivered
} from "../controllers/order.controllers.js"

const orderRouter = express.Router()

// ─── User Orders ────────────────────────────────────────────────────────────────
orderRouter.post("/place", isAuth, placeOrder)
orderRouter.post("/verify-payment", isAuth, verifyPayment)
orderRouter.get("/my-orders", isAuth, getMyOrders)

// ─── Delivery Boy ────────────────────────────────────────────────────────────────
// ⚠️  CRITICAL: These MUST be before /:id — Express matches routes top-down.
//    Without this fix, /assignments, /current, /today-deliveries are caught by /:id.
orderRouter.get("/assignments", isAuth, getDeliveryBoyAssignment)
orderRouter.get("/current", isAuth, getCurrentOrder)
orderRouter.get("/today-deliveries", isAuth, getTodayDeliveries)
orderRouter.post("/accept/:assignmentId", isAuth, acceptOrder)
orderRouter.post("/mark-delivered", isAuth, markDelivered)
orderRouter.post("/send-otp", isAuth, sendDeliveryOtp)
orderRouter.post("/verify-otp", isAuth, verifyDeliveryOtp)

// ─── Owner ───────────────────────────────────────────────────────────────────────
orderRouter.put("/status/:orderId/:shopId", isAuth, updateOrderStatus)

// ─── Dynamic id route LAST ───────────────────────────────────────────────────────
orderRouter.get("/:id", isAuth, getOrderById)

export default orderRouter
