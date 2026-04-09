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
            if (!groupItemsByShop[shopId]) {
                groupItemsByShop[shopId] = []
            }
            groupItemsByShop[shopId].push(item)
        });

        const shopOrders = await Promise.all(Object.keys(groupItemsByShop).map(async (shopId) => {
            const shop = await Shop.findById(shopId).populate("owner")
            if (!shop) {
                throw new Error(`Shop with id ${shopId} not found`)
            }
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

        let newOrder;
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
            
            newOrder = await Order.create({
                user: req.userId,
                paymentMethod,
                deliveryAddress,
                totalAmount,
                shopOrders,
                razorpayOrderId: razorOrder.id,
                payment: false
            })

            return res.status(200).json({
                razorOrder,
                orderId: newOrder._id,
            })
        }

        newOrder = await Order.create({
            user: req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrders
        })

        await newOrder.populate("shopOrders.shopOrderItems.item", "name image price")
        await newOrder.populate("shopOrders.shop", "name image city") // 🔥 POPULATE SHOP
        await newOrder.populate("shopOrders.owner", "fullName socketId")
        await newOrder.populate("user", "fullName email mobile")

        // 🔥 BROADCAST TO DELIVERY BOYS AND SHOP OWNERS
        const io = req.app.get("io")
        if (io) {
            // 🔥 Broadcast to each shop owner in the order
            newOrder.shopOrders.forEach(shopOrder => {
                const ownerId = shopOrder.owner._id.toString()
                io.to(ownerId).emit('newOrder', {
                    _id: newOrder._id,
                    paymentMethod: newOrder.paymentMethod,
                    user: newOrder.user,
                    shopOrder: shopOrder,
                    createdAt: newOrder.createdAt,
                    deliveryAddress: newOrder.deliveryAddress,
                    payment: newOrder.payment
                })
            })
            // 🔥 GLOBAL BROADCAST TO ALL DELIVERY BOYS
            io.emit('newOrder', newOrder)
        }

        return res.status(200).json({
            message: "Order placed successfully",
            orderId: newOrder._id
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body
        if (!instance) {
            // IF FAKE ORDER
            const order = await Order.findById(orderId)
            order.payment = true
            order.razorpayPaymentId = razorpay_payment_id
            await order.save()
            return res.status(200).json(order)
        }

        const payment = await instance.payments.fetch(razorpay_payment_id)
        if (!payment || payment.status !== "captured") {
            return res.status(400).json({ message: "Payment not captured" })
        }
        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(400).json({ message: "Order not found" })
        }

        order.payment = true
        order.razorpayPaymentId = razorpay_payment_id
        await order.save()

        await order.populate("shopOrders.shopOrderItems.item", "name image price")
        await order.populate("shopOrders.shop", "name image city") // 🔥 POPULATE SHOP
        await order.populate("shopOrders.owner", "fullName socketId")
        await order.populate("user", "fullName email mobile")

        const io = req.app.get('io')
        if (io) {
            // 🔥 BROADCAST TO SHOP OWNERS
            order.shopOrders.forEach(shopOrder => {
                const ownerId = shopOrder.owner._id.toString()
                io.to(ownerId).emit('newOrder', {
                    _id: order._id,
                    paymentMethod: order.paymentMethod,
                    user: order.user,
                    shopOrder: shopOrder,
                    createdAt: order.createdAt,
                    deliveryAddress: order.deliveryAddress,
                    payment: order.payment
                })
            })

            // 🔥 GLOBAL BROADCAST TO ALL DELIVERY BOYS
            io.emit('newOrder', order)
        }

        return res.status(200).json(order)
    } catch (error) {
        return res.status(500).json({ message: `Verify payment error: ${error.message}` })
    }
}

export const acceptOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const deliveryBoyId = req.userId;

        const order = await Order.findById(orderId).populate("user");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.deliveryBoy) {
            return res.status(400).json({ message: "Order already accepted by someone else" });
        }

        order.deliveryBoy = deliveryBoyId;
        order.shopOrders.forEach(shopOrder => {
            shopOrder.status = "accepted";
            shopOrder.assignedDeliveryBoy = deliveryBoyId;
        });

        await order.save();

        const updatedOrder = await Order.findById(orderId)
            .populate("deliveryBoy", "fullName mobile")
            .populate("user", "fullName email mobile")
            .populate("shopOrders.shop", "name")
            .populate("shopOrders.shopOrderItems.item", "name image price");

        const io = req.app.get("io");
        if (io) {
            io.to(order.user._id.toString()).emit("orderAccepted", updatedOrder);
            io.emit("orderTaken", orderId);
        }

        res.status(200).json({ message: "Order accepted successfully", order: updatedOrder });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, shopId } = req.params;
        const { status } = req.body;
        const order = await Order.findById(orderId).populate("user deliveryBoy")
            .populate("shopOrders.shop", "name city")
            .populate("shopOrders.shopOrderItems.item", "name price image");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const shopOrder = order.shopOrders.find(so => 
            so.shop && (so.shop._id.toString() === shopId || so.shop.toString() === shopId)
        );
        if (!shopOrder) {
            return res.status(404).json({ message: "Shop order not found" });
        }

        shopOrder.status = status;

        if (status === "delivered") {
            shopOrder.deliveredAt = Date.now();
        }

        let availableBoys = [];
        const io = req.app.get("io");

        if (status === "out of delivery" && !order.deliveryBoy) {
            const onlineBoys = await User.find({ role: "deliveryBoy", isOnline: true }).select('fullName mobile _id');
            availableBoys = onlineBoys;

            if (io && onlineBoys.length > 0) {
                io.emit("newOrder", order);
            }
        }

        await order.save();

        if (io) {
            io.to(order.user._id.toString()).emit("orderStatusUpdated", { orderId, status });
        }

        res.status(200).json({ 
            message: "Status updated successfully", 
            shopOrder: { ...shopOrder.toObject(), availableBoys },
            order
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const manualAssign = async (req, res) => {
    try {
        const { orderId, shopId, deliveryBoyId } = req.body;
        const order = await Order.findById(orderId).populate("user").populate("shopOrders.shop");
        if (!order) return res.status(404).json({ message: "Order not found" });

        if (order.deliveryBoy) {
             return res.status(400).json({ message: "Order already assigned to someone" });
        }

        order.deliveryBoy = deliveryBoyId;
        order.shopOrders.forEach(so => {
            so.assignedDeliveryBoy = deliveryBoyId;
            if(so.shop._id.toString() === shopId || so.shop.toString() === shopId) {
                so.status = "out of delivery";
            } else if (so.status === "pending" || so.status === "preparing") {
                so.status = "accepted";
            }
        });

        await order.save();

        const updatedOrder = await Order.findById(orderId)
            .populate("deliveryBoy", "fullName mobile location")
            .populate("user", "fullName email mobile location")
            .populate("shopOrders.shop", "name")
            .populate("shopOrders.shopOrderItems.item", "name image price");

        const io = req.app.get("io");
        if (io) {
            // Un-broadcast from other boys handled via frontend (by sending orderTaken)
            io.to(order.user._id.toString()).emit("orderAccepted", updatedOrder);
            io.emit("orderTaken", orderId);
            
            // Emit assignedOrder so the delivery boy client picks it up instantly as currentOrder
            io.to(deliveryBoyId).emit("assignedOrder", updatedOrder);
        }

        res.status(200).json({ message: "Delivery boy assigned successfully", order: updatedOrder });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (user.role === "user") {
            const orders = await Order.find({ user: req.userId })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("shopOrders.owner", "fullName email mobile")
                .populate("shopOrders.shopOrderItems.item", "name image price")
                .populate("deliveryBoy", "fullName mobile location")

            return res.status(200).json(orders)
        } else if (user.role === "owner") {
            const orders = await Order.find({ "shopOrders.owner": req.userId })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name city state image")
                .populate("user", "fullName email mobile")
                .populate("shopOrders.shopOrderItems.item", "name image price")
                .populate("deliveryBoy", "fullName mobile")

            const flattenedOrders = []
            orders.forEach(order => {
                const ownerSubOrders = order.shopOrders.filter(o => o.owner.toString() === req.userId)
                ownerSubOrders.forEach(so => {
                    flattenedOrders.push({
                        _id: order._id,
                        paymentMethod: order.paymentMethod,
                        user: order.user,
                        shopOrder: so,
                        createdAt: order.createdAt,
                        deliveryAddress: order.deliveryAddress,
                        payment: order.payment,
                        deliveryBoy: order.deliveryBoy
                    })
                })
            })

            return res.status(200).json(flattenedOrders)
        } else if (user.role === "deliveryBoy") {
            const orders = await Order.find({ deliveryBoy: req.userId })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("user", "fullName mobile email")
                .populate("shopOrders.shopOrderItems.item", "name image price")

            return res.status(200).json(orders)
        }
    } catch (error) {
        return res.status(500).json({ message: `Get orders error: ${error.message}` })
    }
}

export const getAvailableOrders = async (req, res) => {
    try {
        // Pending orders that have no delivery boy assigned
        const orders = await Order.find({ 
            deliveryBoy: null,
            payment: { $ne: false } // Only paid orders if it's online, or any if COD
        })
        .sort({ createdAt: -1 })
        .populate("user", "fullName mobile")
        .populate("shopOrders.shop", "name city")
        .populate("shopOrders.shopOrderItems.item", "name price image")

        res.status(200).json(orders)
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}

export const retryBroadcast = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId).populate("user").populate("shopOrders.shopOrderItems.item", "name image price");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const io = req.app.get("io");
        if (io) {
            const onlineDeliveryBoys = await User.find({ role: "deliveryBoy", isOnline: true });
            if (onlineDeliveryBoys.length > 0) {
                io.emit("newOrder", order);
                return res.status(200).json({ message: "Broadcast retried successfully" });
            } else {
                return res.status(400).json({ message: "No delivery partners online" });
            }
        }
        res.status(500).json({ message: "Socket server not available" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user", "fullName email mobile location")
            .populate("shopOrders.shop", "name")
            .populate("deliveryBoy", "fullName mobile location")
            .populate("shopOrders.shopOrderItems.item", "name image price")

        if (!order) return res.status(404).json({ message: "Order not found" })
        return res.status(200).json(order)
    } catch (error) {
        return res.status(500).json({ message: `Get order error: ${error.message}` })
    }
}

export const sendDeliveryOtp = async (req, res) => {
    try {
        const { orderId } = req.body
        const order = await Order.findById(orderId).populate("user")
        if (!order) return res.status(404).json({ message: "Order not found" })

        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        order.shopOrders.forEach(so => {
            so.deliveryOtp = otp
            so.otpExpires = Date.now() + 5 * 60 * 1000
        })
        await order.save()

        await sendDeliveryOtpMail(order.user.email, otp)
        return res.status(200).json({ message: `OTP sent successfully to ${order.user.fullName}` })
    } catch (error) {
        return res.status(500).json({ message: `Send OTP error: ${error.message}` })
    }
}

export const verifyDeliveryOtp = async (req, res) => {
    try {
        const { orderId, otp } = req.body
        const order = await Order.findById(orderId)
        
        if (!order || order.shopOrders[0].deliveryOtp !== otp || order.shopOrders[0].otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" })
        }

        order.shopOrders.forEach(so => {
            so.status = "delivered"
            so.deliveredAt = Date.now()
        })
        await order.save()

        return res.status(200).json({ message: "Order delivered successfully" })
    } catch (error) {
        return res.status(500).json({ message: `Verify OTP error: ${error.message}` })
    }
}

export const getTodayDeliveries = async (req, res) => {
    try {
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const orders = await Order.find({
            deliveryBoy: req.userId,
            "shopOrders.status": "delivered",
            "shopOrders.deliveredAt": { $gte: startOfDay }
        })

        return res.status(200).json(orders)
    } catch (error) {
        return res.status(500).json({ message: `Get today deliveries error: ${error.message}` })
    }
}

export const getCurrentOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            deliveryBoy: req.userId,
            "shopOrders.status": { $in: ["accepted", "out of delivery"] }
        }).populate("user").populate("shopOrders.shop").populate("deliveryBoy")

        if (!order) return res.status(404).json({ message: "No active assignment" })

        return res.status(200).json(order)
    } catch (error) {
        return res.status(500).json({ message: `Get current order error: ${error.message}` })
    }
}
