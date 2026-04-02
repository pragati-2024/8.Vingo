import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaMotorcycle, FaCheckCircle } from 'react-icons/fa'
import { MdPhone } from 'react-icons/md'
import { serverUrl } from '../App'

// Reuse the same status badge style
const statusConfig = {
    pending:          { label: "Pending",           color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
    preparing:        { label: "Preparing",         color: "text-orange-600 bg-orange-50 border-orange-200" },
    "out of delivery":{ label: "Out for Delivery",  color: "text-blue-600   bg-blue-50   border-blue-200"   },
    picked:           { label: "On the Way",        color: "text-purple-600 bg-purple-50 border-purple-200" },
    delivered:        { label: "Delivered",         color: "text-green-600  bg-green-50  border-green-200"  },
}

function UserOrderCard({ data }) {
    const navigate = useNavigate()
    const [selectedRating, setSelectedRating] = useState({})

    const formatDate = (dateString) => new Date(dateString).toLocaleString('en-GB', {
        day: "2-digit", month: "short", year: "numeric"
    })

    const handleRating = async (itemId, rating) => {
        try {
            await axios.post(`${serverUrl}/api/item/rating`, { itemId, rating }, { withCredentials: true })
            setSelectedRating(prev => ({ ...prev, [itemId]: rating }))
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className='bg-white rounded-lg shadow p-4 space-y-4 border border-gray-100'>
            {/* Order header */}
            <div className='flex justify-between border-b pb-2'>
                <div>
                    <p className='font-semibold'>Order #{data._id?.slice(-6)}</p>
                    <p className='text-sm text-gray-500'>Date: {formatDate(data.createdAt)}</p>
                </div>
                <div className='text-right'>
                    {data.paymentMethod === "cod"
                        ? <p className='text-sm text-gray-500'>COD</p>
                        : <p className='text-sm font-semibold text-gray-600'>
                            Payment: {data.payment ? "✅ Paid" : "❌ Unpaid"}
                          </p>
                    }
                    {/* Overall status from first shopOrder */}
                    {data.shopOrders?.[0] && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                            statusConfig[data.shopOrders[0].status]?.color || "text-gray-600 bg-gray-50 border-gray-200"
                        }`}>
                            {statusConfig[data.shopOrders[0].status]?.label || data.shopOrders[0].status}
                        </span>
                    )}
                </div>
            </div>

            {/* Shop sub-orders */}
            {data.shopOrders?.map((shopOrder, index) => {
                const cfg = statusConfig[shopOrder.status]
                const hasDeliveryBoy = !!(shopOrder.deliveryBoyName || shopOrder.assignedDeliveryBoy?.fullName)
                const deliveryBoyName   = shopOrder.deliveryBoyName || shopOrder.assignedDeliveryBoy?.fullName
                const deliveryBoyMobile = shopOrder.deliveryBoyMobile || shopOrder.assignedDeliveryBoy?.mobile

                return (
                    <div key={index} className='border rounded-lg p-3 bg-[#fffaf7] space-y-3'>
                        <div className='flex justify-between items-center'>
                            <p className='font-semibold text-gray-800'>{shopOrder.shop?.name}</p>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cfg?.color || "text-gray-600 bg-gray-50 border-gray-200"}`}>
                                {cfg?.label || shopOrder.status}
                            </span>
                        </div>

                        {/* Items */}
                        <div className='flex space-x-4 overflow-x-auto pb-2'>
                            {shopOrder.shopOrderItems?.map((item, i) => (
                                <div key={i} className='flex-shrink-0 w-40 border rounded-lg p-2 bg-white'>
                                    <img src={item.item?.image} alt="" className='w-full h-24 object-cover rounded' />
                                    <p className='text-sm font-semibold mt-1'>{item.name}</p>
                                    <p className='text-xs text-gray-500'>Qty: {item.quantity} × ₹{item.price}</p>
                                    {shopOrder.status === "delivered" && (
                                        <div className='flex space-x-1 mt-2'>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    className={`text-lg ${selectedRating[item.item?._id] >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    onClick={() => handleRating(item.item?._id, star)}
                                                >★</button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Delivery boy info (shown once assigned) */}
                        {(shopOrder.status === "out of delivery" || shopOrder.status === "picked" || shopOrder.status === "delivered") && (
                            <div className={`rounded-lg p-3 border text-sm ${
                                shopOrder.status === "delivered"  ? "bg-green-50 border-green-100" :
                                shopOrder.status === "picked"     ? "bg-purple-50 border-purple-100" :
                                                                    "bg-blue-50 border-blue-100"
                            }`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <FaMotorcycle className={
                                        shopOrder.status === "delivered" ? "text-green-500" :
                                        shopOrder.status === "picked"    ? "text-purple-500" :
                                                                           "text-blue-500"
                                    } size={14} />
                                    <p className='font-bold text-gray-700 text-xs uppercase tracking-wide'>
                                        {shopOrder.status === "delivered" ? "Delivered by" :
                                         shopOrder.status === "picked"    ? "En Route" :
                                                                            "Assigned Delivery Boy"}
                                    </p>
                                </div>

                                {hasDeliveryBoy ? (
                                    <div className='flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100'>
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-orange-50 rounded-full flex items-center justify-center text-[#ff4d2d] font-black text-xs">
                                                {deliveryBoyName?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className='font-bold text-gray-800 text-sm'>{deliveryBoyName}</span>
                                        </div>
                                        {deliveryBoyMobile && (
                                            <a
                                                href={`tel:${deliveryBoyMobile}`}
                                                className='flex items-center gap-1 text-[#ff4d2d] text-xs font-bold hover:underline'
                                            >
                                                <MdPhone size={12} /> {deliveryBoyMobile}
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <p className='text-gray-500 italic text-xs'>Searching for a delivery partner…</p>
                                )}
                            </div>
                        )}

                        <div className='flex justify-between items-center border-t pt-2'>
                            <p className='font-semibold text-gray-700'>Subtotal: ₹{shopOrder.subtotal}</p>
                        </div>
                    </div>
                )
            })}

            {/* Footer */}
            <div className='flex justify-between items-center border-t pt-2'>
                <p className='font-semibold'>Total: ₹{data.totalAmount}</p>
                <button
                    className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm'
                    onClick={() => navigate(`/track-order/${data._id}`)}
                >
                    Track Order
                </button>
            </div>
        </div>
    )
}

export default UserOrderCard
