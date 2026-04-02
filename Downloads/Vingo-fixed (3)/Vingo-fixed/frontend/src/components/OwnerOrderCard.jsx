import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { MdPhone, MdDeliveryDining } from "react-icons/md";
import { FaMotorcycle, FaCheckCircle, FaCircle } from "react-icons/fa";
import { serverUrl } from '../App';
import { useSelector } from 'react-redux';

// ── Small status badge ──────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const map = {
        pending:         { label: "Pending",          cls: "bg-yellow-100 text-yellow-700" },
        preparing:       { label: "Preparing",        cls: "bg-orange-100 text-orange-600" },
        "out of delivery":{ label: "Out for Delivery", cls: "bg-blue-100 text-blue-600"   },
        picked:          { label: "Picked Up",        cls: "bg-purple-100 text-purple-600"},
        delivered:       { label: "Delivered",        cls: "bg-green-100 text-green-600"  },
    }
    const { label, cls } = map[status] || { label: status, cls: "bg-gray-100 text-gray-600" }
    return (
        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${cls}`}>
            {label}
        </span>
    )
}

// ── Delivery progress stepper ────────────────────────────────────────────────
const DeliveryProgress = ({ status }) => {
    const steps = ["out of delivery", "picked", "delivered"]
    const idx   = steps.indexOf(status)
    return (
        <div className="flex items-center gap-2 mt-2">
            {["Assigned", "Picked Up", "Delivered"].map((label, i) => (
                <React.Fragment key={label}>
                    <div className="flex items-center gap-1">
                        {i <= idx
                            ? <FaCheckCircle className="text-green-500" size={14} />
                            : <FaCircle className="text-gray-200" size={14} />
                        }
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${i <= idx ? "text-green-600" : "text-gray-400"}`}>
                            {label}
                        </span>
                    </div>
                    {i < 2 && <div className={`flex-1 h-0.5 ${i < idx ? "bg-green-400" : "bg-gray-100"}`} />}
                </React.Fragment>
            ))}
        </div>
    )
}

// ────────────────────────────────────────────────────────────────────────────
function OwnerOrderCard({ data, onStatusUpdate }) {
    const { socket } = useSelector(state => state.user)

    // Local copy of shopOrder so we can mutate on the fly
    const [shopOrder, setShopOrder] = useState(data.shopOrder)
    const [updating,  setUpdating]  = useState(false)
    const [statusMsg, setStatusMsg] = useState("")

    // Keep in sync if parent re-renders with fresh data
    useEffect(() => { setShopOrder(data.shopOrder) }, [data.shopOrder])

    // Socket: delivery boy accepted → update delivery boy info instantly
    useEffect(() => {
        if (!socket) return
        const handler = (payload) => {
            if (
                payload.orderId?.toString() === data._id?.toString() &&
                payload.shopId?.toString()  === shopOrder.shop?._id?.toString()
            ) {
                setShopOrder(prev => ({
                    ...prev,
                    status:          "picked",
                    deliveryStatus:  "picked",
                    deliveryBoyName: payload.deliveryBoy?.fullName || prev.deliveryBoyName,
                    deliveryBoyMobile: payload.deliveryBoy?.mobile || prev.deliveryBoyMobile,
                }))
                setStatusMsg(`🚀 ${payload.deliveryBoy?.fullName} picked up the order!`)
            }
        }
        socket.on("orderAccepted", handler)
        return () => socket.off("orderAccepted", handler)
    }, [socket, data._id, shopOrder.shop?._id])

    const handleUpdateStatus = async (newStatus) => {
        setUpdating(true)
        setStatusMsg("")
        try {
            const res = await axios.put(
                `${serverUrl}/api/order/status/${data._id}/${shopOrder.shop._id}`,
                { status: newStatus },
                { withCredentials: true }
            )
            const updated = res.data.shopOrder
            setShopOrder(prev => ({
                ...prev,
                status:            updated.status           ?? newStatus,
                deliveryBoyName:   updated.deliveryBoyName  ?? prev.deliveryBoyName,
                deliveryBoyMobile: updated.deliveryBoyMobile?? prev.deliveryBoyMobile,
                deliveryStatus:    updated.deliveryStatus   ?? prev.deliveryStatus,
                assignedDeliveryBoy: updated.assignedDeliveryBoy ?? prev.assignedDeliveryBoy,
            }))
            setStatusMsg(res.data.message || "Status updated")
            onStatusUpdate?.()
        } catch (error) {
            console.error("Update status error:", error)
            setStatusMsg("Error updating status")
        } finally {
            setUpdating(false)
        }
    }

    const isOutForDelivery = shopOrder.status === "out of delivery"
    const isPicked         = shopOrder.status === "picked"
    const isDelivered      = shopOrder.status === "delivered"
    const hasDeliveryBoy   = !!(shopOrder.deliveryBoyName || shopOrder.assignedDeliveryBoy?.fullName)
    const deliveryBoyName  = shopOrder.deliveryBoyName || shopOrder.assignedDeliveryBoy?.fullName || null
    const deliveryBoyPhone = shopOrder.deliveryBoyMobile || shopOrder.assignedDeliveryBoy?.mobile || null

    return (
        <div className='bg-white rounded-xl shadow-md p-5 space-y-4 border border-gray-100 hover:shadow-lg transition-shadow'>
            {/* Header */}
            <div className='flex justify-between items-start'>
                <div>
                    <h2 className='text-lg font-bold text-gray-800'>{data.user?.fullName}</h2>
                    <p className='text-sm text-gray-500'>{data.user?.email}</p>
                    <p className='flex items-center gap-2 text-sm text-gray-600 mt-1'>
                        <MdPhone className='text-[#ff4d2d]' />
                        <span>{data.user?.mobile}</span>
                    </p>
                </div>
                <div className='text-right'>
                    <p className='text-xs font-semibold text-gray-400 uppercase'>Payment</p>
                    <p className='text-sm font-medium text-gray-700'>
                        {data.paymentMethod === "online"
                            ? (data.payment ? "Paid (Online)" : "Unpaid (Online)")
                            : "Cash on Delivery"
                        }
                    </p>
                </div>
            </div>

            {/* Delivery address */}
            <div className='p-3 bg-gray-50 rounded-lg'>
                <p className='text-sm text-gray-600 font-medium'>Delivery Address:</p>
                <p className='text-sm text-gray-500'>{data.deliveryAddress?.text}</p>
            </div>

            {/* Items */}
            <div className='flex space-x-4 overflow-x-auto pb-2'>
                {shopOrder.shopOrderItems?.map((item, index) => (
                    <div key={index} className='flex-shrink-0 w-32 border border-gray-100 rounded-lg p-2 bg-white'>
                        <img
                            src={item.item?.image || 'https://via.placeholder.com/150'}
                            alt={item.name}
                            className='w-full h-20 object-cover rounded-md mb-2'
                        />
                        <p className='text-xs font-bold text-gray-800 truncate'>{item.name}</p>
                        <p className='text-[10px] text-gray-500'>Qty: {item.quantity} × ₹{item.price}</p>
                    </div>
                ))}
            </div>

            {/* Status row */}
            <div className='flex justify-between items-center pt-3 border-t border-gray-100'>
                <div className='flex items-center gap-2'>
                    <span className='text-sm text-gray-600'>Status:</span>
                    <StatusBadge status={shopOrder.status} />
                </div>

                {!isDelivered && (
                    <select
                        disabled={updating}
                        className='rounded-lg border-2 border-[#ff4d2d] px-3 py-1 text-sm font-semibold text-[#ff4d2d] focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:opacity-60'
                        value={shopOrder.status}
                        onChange={e => handleUpdateStatus(e.target.value)}
                    >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="out of delivery">Out For Delivery</option>
                    </select>
                )}
            </div>

            {/* Inline status message */}
            {statusMsg && (
                <p className='text-xs text-center text-orange-600 font-semibold bg-orange-50 py-1 rounded-lg'>
                    {statusMsg}
                </p>
            )}

            {/* ── Delivery Boy Panel ─────────────────────────────────────────────── */}
            {(isOutForDelivery || isPicked || isDelivered) && (
                <div className={`mt-2 p-4 rounded-xl border text-sm ${
                    isDelivered   ? "bg-green-50 border-green-100" :
                    isPicked      ? "bg-purple-50 border-purple-100" :
                                    "bg-blue-50 border-blue-100"
                }`}>
                    <div className="flex items-center gap-2 mb-3">
                        <FaMotorcycle className={
                            isDelivered ? "text-green-500" : isPicked ? "text-purple-500" : "text-blue-500"
                        } />
                        <p className='font-bold text-gray-800'>
                            {isDelivered ? "Delivered by" : isPicked ? "En Route — Delivery Boy" : "Assigned Delivery Boy"}
                        </p>
                    </div>

                    {hasDeliveryBoy ? (
                        <>
                            <div className='flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100'>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-orange-50 rounded-full flex items-center justify-center text-[#ff4d2d] font-black text-sm">
                                        {deliveryBoyName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className='font-bold text-gray-800'>{deliveryBoyName}</p>
                                        {deliveryBoyPhone && (
                                            <a href={`tel:${deliveryBoyPhone}`}
                                                className='text-[10px] text-gray-400 flex items-center gap-1 hover:text-[#ff4d2d]'>
                                                <MdPhone size={10} /> {deliveryBoyPhone}
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <StatusBadge status={
                                    isDelivered ? "delivered" : isPicked ? "picked" : "out of delivery"
                                } />
                            </div>

                            {/* Progress steps for out-for-delivery / picked */}
                            {!isDelivered && (
                                <DeliveryProgress status={shopOrder.status} />
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-between">
                            <p className='text-gray-500 italic text-xs'>
                                {updating ? "Assigning delivery boy…" : "Searching for a delivery boy…"}
                            </p>
                            <button
                                onClick={() => handleUpdateStatus("out of delivery")}
                                disabled={updating}
                                className='ml-3 bg-[#ff4d2d] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-600 transition-all disabled:opacity-60'
                            >
                                Retry Assignment
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className='flex justify-between items-center pt-2'>
                <span className='text-gray-400 text-xs'>Order ID: …{data._id?.slice(-6)}</span>
                <span className='text-lg font-bold text-gray-900'>Total: ₹{shopOrder.subtotal}</span>
            </div>
        </div>
    )
}

export default OwnerOrderCard
