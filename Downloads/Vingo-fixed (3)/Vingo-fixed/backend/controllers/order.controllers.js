import DeliveryAssignment from "../models/deliveryAssignment.model.js"
import Order from "../models/order.model.js"
import Shop from "../models/shop.model.js"
import User from "../models/user.model.js"
import { sendDeliveryOtpMail } from "../utils/mail.js"
import RazorPay from "razorpay"
import dotenv from "dotenv"

dotenv.config()

let instance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    instance = new RazorPay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: find first available delivery boy near the delivery address
// Falls back progressively: geo-near → any online → any deliveryBoy
// ─────────────────────────────────────────────────────────────────────────────
async function findAvailableDeliveryBoy(longitude, latitude) {
    // Tier 1 – nearby (500 km radius)
    let candidates = await User.find({
        role: "deliveryBoy",
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
                $maxDistance: 500000
            }
        }
    }).limit(20)

    // Tier 2 – any online delivery boy
    if (candidates.length === 0) {
        candidates = await User.find({ role: "deliveryBoy", isOnline: true })
    }

    // Tier 3 – any delivery boy (dev/testing fallback)
    if (candidates.length === 0) {
        candidates = await User.find({ role: "deliveryBoy" }).limit(20)
    }

    if (candidates.length === 0) return null;

    // Filter out those currently on an active assignment
    const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: candidates.map(c => c._id) },
        status: { $in: ["broadcasted", "assigned"] }
    }).distinct("assignedTo")

    const busySet = new Set(busyIds.map(id => id.toString()))
    const available = candidates.filter(b => !busySet.has(b._id.toString()))

    return available.length > 0 ? available[0] : candidates[0] // last-resort: return first even if busy
}

// ─────────────────────────────────────────────────────────────────────────────
// Place Order
// ─────────────────────────────────────────────────────────────────────────────
export const placeOrder = async (req, res) => {
    try {
        const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty" })
        }
        if (!deliveryAddress.text || !deliveryAddress.latitude || !deliveryAddress.longitude) {
            return res.status(400).json({ message: "Please provide complete delivery address" })
        }

        const groupItemsByShop = {}
        cartItems.forEach(item => {
            const shopId = item.shop
            if (!groupItemsByShop[shopId]) groupItemsByShop[shopId] = []
            groupItemsByShop[shopId].push(item)
        });

        const shopOrders = await Promise.all(Object.keys(groupItemsByShop).map(async (shopId) => {
            const shop = await Shop.findById(shopId).populate("owner")
            if (!shop) throw new Error(`Shop with id ${shopId} not found`)
            const items = groupItemsByShop[shopId]
            const subtotal = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0)
            return {
                shop: shop._id,
                owner: shop.owner._id,
                subtotal,
                shopOrderItems: items.map((i) => ({
                    item: i.item || i._id || i.id,
                    price: i.price,
                    quantity: i.quantity,
                    name: i.name
                }))
            }
        }))

        if (paymentMethod === "online") {
            let razorOrder;
            if (instance) {
                razorOrder = await instance.orders.create({
                    amount: Math.round(totalAmount * 100),
                    currency: 'INR',
                    receipt: `receipt_${Date.now()}`
                })
            } else {
                razorOrder = {
                    id: `order_fake_${Date.now()}`,
                    amount: Math.round(totalAmount * 100),
                    currency: 'INR'
                }
            }

            const newOrder = await Order.create({
                user: req.userId,
                paymentMethod,
                deliveryAddress,
                totalAmount,
                shopOrders,
                razorpayOrderId: razorOrder.id,
                payment: false
            })

            return res.status(200).json({ razorOrder, orderId: newOrder._id })
        }

        const newOrder = await Order.create({
            user: req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrders
        })

        await newOrder.populate("shopOrders.shopOrderItems.item", "name image price")
        await newOrder.populate("shopOrders.shop", "name")
        await newOrder.populate("shopOrders.owner", "fullName socketId")
        await newOrder.populate("user", "fullName email mobile")

        const io = req.app.get('io')
        if (io) {
            newOrder.shopOrders.forEach(shopOrder => {
                io.to(shopOrder.owner._id.toString()).emit('newOrder', {
                    _id: newOrder._id,
                    paymentMethod: newOrder.paymentMethod,
                    user: newOrder.user,
                    shopOrder: shopOrder,
                    createdAt: newOrder.createdAt,
                    deliveryAddress: newOrder.deliveryAddress,
                    payment: newOrder.payment
                })
            });
        }

        return res.status(201).json(newOrder)
    } catch (error) {
        return res.status(500).json({ message: `Place order error: ${error.message}` })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Verify Payment
// ─────────────────────────────────────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, orderId } = req.body

        if (!instance || razorpay_payment_id === "fake_payment_id") {
            const order = await Order.findById(orderId)
            if (!order) return res.status(400).json({ message: "Order not found" })
            order.payment = true
            order.razorpayPaymentId = razorpay_payment_id || "fake_payment_id"
            await order.save()
            return res.status(200).json(order)
        }

        const payment = await instance.payments.fetch(razorpay_payment_id)
        if (!payment || payment.status !== "captured") {
            return res.status(400).json({ message: "Payment not captured" })
        }
        const order = await Order.findById(orderId)
        if (!order) return res.status(400).json({ message: "Order not found" })

        order.payment = true
        order.razorpayPaymentId = razorpay_payment_id
        await order.save()

        await order.populate("shopOrders.shopOrderItems.item", "name image price")
        await order.populate("shopOrders.shop", "name")
        await order.populate("shopOrders.owner", "fullName socketId")
        await order.populate("user", "fullName email mobile")

        const io = req.app.get('io')
        if (io) {
            order.shopOrders.forEach(shopOrder => {
                io.to(shopOrder.owner._id.toString()).emit('newOrder', {
                    _id: order._id,
                    paymentMethod: order.paymentMethod,
                    user: order.user,
                    shopOrder: shopOrder,
                    createdAt: order.createdAt,
                    deliveryAddress: order.deliveryAddress,
                    payment: order.payment
                })
            });
        }

        return res.status(200).json(order)
    } catch (error) {
        return res.status(500).json({ message: `Verify payment error: ${error.message}` })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Get My Orders  (user | owner)
// ─────────────────────────────────────────────────────────────────────────────
export const getMyOrders = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (user.role === "user") {
            const orders = await Order.find({ user: req.userId })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("shopOrders.owner", "fullName email mobile")
                .populate("shopOrders.shopOrderItems.item", "name image price")
            return res.status(200).json(orders)
        }

        if (user.role === "owner") {
            const orders = await Order.find({ "shopOrders.owner": req.userId })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name city state")
                .populate("user")
                .populate("shopOrders.shopOrderItems.item", "name image price")
                .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")

            const flattenedOrders = []
            orders.forEach(order => {
                const ownerSubOrders = order.shopOrders.filter(
                    o => o.owner.toString() === req.userId
                )
                ownerSubOrders.forEach(so => {
                    flattenedOrders.push({
                        _id: order._id,
                        paymentMethod: order.paymentMethod,
                        user: order.user,
                        shopOrder: so.toObject(),
                        createdAt: order.createdAt,
                        deliveryAddress: order.deliveryAddress,
                        payment: order.payment
                    })
                })
            })
            return res.status(200).json(flattenedOrders)
        }
    } catch (error) {
        return res.status(500).json({ message: `Get orders error: ${error.message}` })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Update Order Status  (Owner)
// When moved to "out of delivery" → AUTO-ASSIGN first available delivery boy
// ─────────────────────────────────────────────────────────────────────────────
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, shopId } = req.params
        const { status } = req.body

        const order = await Order.findById(orderId).populate("shopOrders.shop")
        if (!order) return res.status(404).json({ message: "Order not found" })

        const shopOrder = order.shopOrders.find(o => o.shop._id.toString() === shopId)
        if (!shopOrder) return res.status(400).json({ message: "Shop order not found" })

        shopOrder.status = status

        if (status === "out of delivery") {
            const { longitude, latitude } = order.deliveryAddress
            const deliveryBoy = await findAvailableDeliveryBoy(longitude, latitude)

            if (deliveryBoy) {
                // ── Auto-assign: one delivery boy gets the order directly ──
                shopOrder.assignedDeliveryBoy = deliveryBoy._id
                shopOrder.deliveryBoyName    = deliveryBoy.fullName
                shopOrder.deliveryBoyMobile  = deliveryBoy.mobile || null
                shopOrder.deliveryStatus     = "assigned"

                // Create (or update) the assignment record
                let deliveryAssignment
                if (shopOrder.assignment) {
                    deliveryAssignment = await DeliveryAssignment.findById(shopOrder.assignment)
                }

                if (deliveryAssignment) {
                    // Reassign
                    deliveryAssignment.assignedTo   = deliveryBoy._id
                    deliveryAssignment.brodcastedTo = [deliveryBoy._id]
                    deliveryAssignment.status       = "broadcasted"
                    deliveryAssignment.acceptedAt   = null
                    await deliveryAssignment.save()
                } else {
                    deliveryAssignment = await DeliveryAssignment.create({
                        order:       order._id,
                        shop:        shopOrder.shop._id,
                        shopOrderId: shopOrder._id,
                        brodcastedTo:[deliveryBoy._id],
                        assignedTo:  deliveryBoy._id,   // pre-assign
                        status:      "broadcasted"      // delivery boy must still Accept
                    })
                    shopOrder.assignment = deliveryAssignment._id
                }

                // Notify delivery boy via socket
                const io = req.app.get('io')
                if (io) {
                    io.to(deliveryBoy._id.toString()).emit('deliveryAvailable', {
                        assignmentId:    deliveryAssignment._id,
                        orderId:         order._id,
                        shopName:        shopOrder.shop.name,
                        deliveryAddress: order.deliveryAddress,
                        items:           shopOrder.shopOrderItems,
                        subtotal:        shopOrder.subtotal
                    })
                }
            } else {
                // No delivery boy found – leave a note but still save
                console.warn(`[Order ${orderId}] No delivery boy available for assignment.`)
            }
        }

        await order.save()

        // Notify the customer about status change
        const io = req.app.get('io')
        if (io) {
            io.to(order.user.toString()).emit('update-status', {
                orderId: order._id,
                shopId,
                status,
                deliveryBoyName:   shopOrder.deliveryBoyName   || null,
                deliveryBoyMobile: shopOrder.deliveryBoyMobile || null
            })
        }

        return res.status(200).json({
            message: shopOrder.deliveryBoyName
                ? `Order assigned to ${shopOrder.deliveryBoyName}`
                : status === "out of delivery"
                    ? "Status updated – no delivery boy found nearby"
                    : "Status updated successfully",
            shopOrder: shopOrder.toObject()
        })
    } catch (error) {
        return res.status(500).json({ message: `Update status error: ${error.message}` })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Delivery Boy Assignments
// Returns assignments where THIS delivery boy is the assignedTo AND status is
// "broadcasted" (waiting for the boy to tap Accept).
// ─────────────────────────────────────────────────────────────────────────────
export const getDeliveryBoyAssignment = async (req, res) => {
    try {
        const assignments = await DeliveryAssignment.find({
            assignedTo: req.userId,
            status: "broadcasted"
        })
        .populate({
            path: "order",
            populate: { path: "shopOrders.shop", select: "name" }
        })
        .populate("shop", "name")

        const formatted = assignments.map(a => {
            if (!a.order) return null;
            const shopOrder = a.order.shopOrders.find(
                so => so._id.toString() === a.shopOrderId.toString()
            ) || a.order.shopOrders.find(
                so => so.shop?._id?.toString() === a.shop?._id?.toString()
            )
            if (!shopOrder) return null;
            return {
                assignmentId:    a._id,
                orderId:         a.order._id,
                shopName:        shopOrder.shop?.name || "Unknown Shop",
                deliveryAddress: a.order.deliveryAddress,
                items:           shopOrder.shopOrderItems || [],
                subtotal:        shopOrder.subtotal
            }
        }).filter(Boolean)

        return res.status(200).json(formatted)
    } catch (error) {
        return res.status(500).json({ message: `Get assignments error: ${error.message}` })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Accept Order  (Delivery Boy taps Accept → status: picked)
// ─────────────────────────────────────────────────────────────────────────────
export const acceptOrder = async (req, res) => {
    try {
        const { assignmentId } = req.params
        const assignment = await DeliveryAssignment.findById(assignmentId)
        if (!assignment) return res.status(404).json({ message: "Assignment not found" })

        if (assignment.status !== "broadcasted") {
            return res.status(400).json({ message: "Assignment is no longer available" })
        }

        // Make sure this delivery boy is actually assigned
        if (assignment.assignedTo?.toString() !== req.userId) {
            return res.status(403).json({ message: "This order is not assigned to you" })
        }

        // Mark as accepted / en-route
        assignment.status     = "assigned"
        assignment.acceptedAt = new Date()
        await assignment.save()

        // Update the shop sub-order
        const order    = await Order.findById(assignment.order)
        const shopOrder = order.shopOrders.id(assignment.shopOrderId)

        shopOrder.status          = "picked"
        shopOrder.deliveryStatus  = "picked"
        await order.save()

        // Fetch delivery boy details for notifications
        const deliveryBoy = await User.findById(req.userId).select("fullName mobile")

        const io = req.app.get('io')
        if (io) {
            // Notify Owner
            io.to(shopOrder.owner.toString()).emit("orderAccepted", {
                orderId:     order._id,
                shopId:      shopOrder.shop,
                deliveryBoy: { _id: deliveryBoy._id, fullName: deliveryBoy.fullName, mobile: deliveryBoy.mobile }
            })
            // Notify User
            io.to(order.user.toString()).emit("update-status", {
                orderId:         order._id,
                shopId:          shopOrder.shop,
                status:          "picked",
                deliveryBoyName: deliveryBoy.fullName,
                deliveryBoyMobile: deliveryBoy.mobile
            })
        }

        return res.status(200).json({ message: "Order accepted – you are now en route!" })
    } catch (error) {
        return res.status(500).json({ message: `Accept order error: ${error.message}` })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Current Active Delivery  (Delivery Boy)
// ─────────────────────────────────────────────────────────────────────────────
export const getCurrentOrder = async (req, res) => {
    try {
        // "assigned" means the boy accepted and is en-route
        const assignment = await DeliveryAssignment.findOne({
            assignedTo: req.userId,
            status: "assigned"
        })

        if (!assignment) return res.status(404).json({ message: "No active assignment" })

        const order    = await Order.findById(assignment.order).populate("user", "fullName mobile email")
        if (!order) return res.status(404).json({ message: "Order not found" })

        const shopOrder = order.shopOrders.id(assignment.shopOrderId)
        if (!shopOrder) return res.status(404).json({ message: "Shop order not found" })

        return res.status(200).json({
            _id:             order._id,
            user:            order.user,
            shopOrder,
            deliveryAddress: order.deliveryAddress
        })
    } catch (error) {
        return res.status(500).json({ message: `Get current order error: ${error.message}` })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Order By ID
// ─────────────────────────────────────────────────────────────────────────────
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user")
            .populate("shopOrders.shop")
            .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")
            .populate("shopOrders.shopOrderItems.item")

        if (!order) return res.status(404).json({ message: "Order not found" })
        return res.status(200).json(order)
    } catch (error) {
        return res.status(500).json({ message: `Get order error: ${error.message}` })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Send Delivery OTP  (Delivery Boy confirms arrival)
// ─────────────────────────────────────────────────────────────────────────────
export const sendDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.body
        const order     = await Order.findById(orderId).populate("user")
        const shopOrder = order?.shopOrders.id(shopOrderId)
        if (!order || !shopOrder) return res.status(404).json({ message: "Order or shop order not found" })

        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        shopOrder.deliveryOtp = otp
        shopOrder.otpExpires  = Date.now() + 5 * 60 * 1000
        await order.save()

        await sendDeliveryOtpMail(order.user.email, otp)
        return res.status(200).json({ message: `OTP sent to ${order.user.fullName}` })
    } catch (error) {
        return res.status(500).json({ message: `Send OTP error: ${error.message}` })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Verify Delivery OTP  (Customer hands over OTP → order delivered)
// ─────────────────────────────────────────────────────────────────────────────
export const verifyDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId, otp } = req.body
        const order     = await Order.findById(orderId)
        const shopOrder = order?.shopOrders.id(shopOrderId)

        if (!shopOrder || shopOrder.deliveryOtp !== otp || shopOrder.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" })
        }

        shopOrder.status         = "delivered"
        shopOrder.deliveryStatus = "delivered"
        shopOrder.deliveredAt    = Date.now()
        shopOrder.deliveryOtp    = null
        await order.save()

        await DeliveryAssignment.findOneAndUpdate(
            { shopOrderId: shopOrder._id, status: "assigned" },
            { status: "completed" }
        )

        const io = req.app.get('io')
        if (io) {
            io.to(order.user.toString()).emit("update-status", {
                orderId: order._id,
                shopId:  shopOrder.shop,
                status:  "delivered"
            })
            io.to(shopOrder.owner.toString()).emit("update-status", {
                orderId: order._id,
                shopId:  shopOrder.shop,
                status:  "delivered"
            })
        }

        return res.status(200).json({ message: "Order delivered successfully!" })
    } catch (error) {
        return res.status(500).json({ message: `Verify OTP error: ${error.message}` })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mark Delivered (alternative – delivery boy marks without OTP)
// ─────────────────────────────────────────────────────────────────────────────
export const markDelivered = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.body
        const order     = await Order.findById(orderId)
        const shopOrder = order?.shopOrders.id(shopOrderId)
        if (!order || !shopOrder) return res.status(404).json({ message: "Order not found" })

        shopOrder.status         = "delivered"
        shopOrder.deliveryStatus = "delivered"
        shopOrder.deliveredAt    = Date.now()
        await order.save()

        await DeliveryAssignment.findOneAndUpdate(
            { shopOrderId: shopOrder._id, status: "assigned" },
            { status: "completed" }
        )

        const io = req.app.get('io')
        if (io) {
            io.to(order.user.toString()).emit("update-status", {
                orderId: order._id, shopId: shopOrder.shop, status: "delivered"
            })
        }

        return res.status(200).json({ message: "Order marked as delivered" })
    } catch (error) {
        return res.status(500).json({ message: `Mark delivered error: ${error.message}` })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Today's Deliveries  (Delivery Boy stats)
// ─────────────────────────────────────────────────────────────────────────────
export const getTodayDeliveries = async (req, res) => {
    try {
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const completedAssignments = await DeliveryAssignment.find({
            assignedTo: req.userId,
            status: "completed",
            updatedAt: { $gte: startOfDay }
        })

        // For each completed assignment, grab the shop sub-order
        const deliveries = []
        for (const a of completedAssignments) {
            const order = await Order.findById(a.order)
            if (!order) continue
            const so = order.shopOrders.id(a.shopOrderId)
            if (so) deliveries.push({ ...so.toObject(), orderId: order._id })
        }

        return res.status(200).json(deliveries)
    } catch (error) {
        return res.status(500).json({ message: `Get today deliveries error: ${error.message}` })
    }
}
