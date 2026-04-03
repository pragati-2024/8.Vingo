import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { IoIosArrowRoundBack } from "react-icons/io"
import { MdPhone, MdLocationOn } from "react-icons/md"

import { serverUrl } from '../App'
import DeliveryBoyTracking from '../components/DeliveryBoyTracking'

function TrackOrderPage() {
    const { orderId } = useParams()
    const [currentOrder, setCurrentOrder] = useState(null) 
    const navigate = useNavigate()
    const { socket } = useSelector(state => state.user)
    const [liveLocations, setLiveLocations] = useState({})

    const handleGetOrder = async () => {
        if (orderId === "dummy_order_123") {
            setCurrentOrder({
                _id: "dummy_order_123",
                deliveryAddress: { text: "GLA University, Mathura", latitude: 27.6057, longitude: 77.5933 },
                shopOrders: [{
                    shop: { name: "Pizza Hut (Dummy)" },
                    status: "out of delivery",
                    subtotal: 350,
                    shopOrderItems: [{ name: "Cheese Pizza", quantity: 1 }],
                    assignedDeliveryBoy: {
                        _id: "dummy_dboy_123",
                        fullName: "Dummy Delivery Boy",
                        mobile: "9999999999",
                        location: { coordinates: [77.5933, 27.6057] }
                    }
                }]
            });
            return;
        }
        try {
            const result = await axios.get(`${serverUrl}/api/order/${orderId}`, { withCredentials: true })
            setCurrentOrder(result.data)
        } catch (error) {
            console.error("Fetch order error:", error)
        }
    }

    useEffect(() => {
        if (socket) {
            const handleUpdateLocation = ({ deliveryBoyId, latitude, longitude }) => {
                setLiveLocations(prev => ({
                    ...prev,
                    [deliveryBoyId]: { lat: latitude, lon: longitude }
                }))
            }
            socket.on('updateDeliveryLocation', handleUpdateLocation)
            return () => socket.off('updateDeliveryLocation', handleUpdateLocation)
        }
    }, [socket])

    useEffect(() => {
        handleGetOrder()
    }, [orderId])

    if (!currentOrder) return <div className='h-screen flex items-center justify-center'>Loading order details...</div>

    return (
        <div className='min-h-screen bg-[#fff9f6] pb-10'>
            <div className='max-w-4xl mx-auto px-4'>
                <div className='flex items-center gap-4 py-8 cursor-pointer' onClick={() => navigate("/")}>
                    <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
                    <h1 className='text-2xl font-black text-gray-900'>Track Your Order</h1>
                </div>

                <div className='space-y-8'>
                    {currentOrder.shopOrders.map((shopOrder, index) => (
                        <div key={index} className='bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-50'>
                            <div className='p-6 bg-gradient-to-r from-orange-50 to-white border-b border-orange-100'>
                                <h2 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
                                    <span className='w-2 h-2 rounded-full bg-[#ff4d2d]'></span>
                                    {shopOrder.shop.name}
                                </h2>
                                <p className='text-sm text-gray-500 mt-1'>Status: <span className='font-bold text-[#ff4d2d] uppercase'>{shopOrder.status}</span></p>
                            </div>

                            <div className='p-6 grid grid-cols-1 md:grid-cols-2 gap-8'>
                                <div className='space-y-4'>
                                    <div>
                                        <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-2'>Order Items</p>
                                        <div className='flex flex-wrap gap-2'>
                                            {shopOrder.shopOrderItems.map((item, i) => (
                                                <span key={i} className='bg-gray-50 px-3 py-1 rounded-full text-sm font-medium text-gray-700 border border-gray-100'>
                                                    {item.name} x {item.quantity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className='flex items-start gap-2 text-gray-600'>
                                        <MdLocationOn className='text-[#ff4d2d] mt-1' size={20} />
                                        <div>
                                            <p className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Delivery Address</p>
                                            <p className='text-sm leading-relaxed'>{currentOrder.deliveryAddress.text}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-4'>
                                    {shopOrder.status === "delivered" ? (
                                        <div className='bg-green-50 p-6 rounded-2xl border border-green-100 flex flex-col items-center justify-center text-center'>
                                            <div className='w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white mb-3'>✓</div>
                                            <h3 className='text-green-800 font-bold text-lg'>Order Delivered!</h3>
                                            <p className='text-green-600 text-sm'>Enjoy your meal</p>
                                        </div>
                                    ) : shopOrder.assignedDeliveryBoy ? (
                                        <div className='bg-blue-50 p-6 rounded-2xl border border-blue-100'>
                                            <p className='text-xs font-bold text-blue-400 uppercase tracking-wider mb-3'>Delivery Partner</p>
                                            <div className='flex items-center gap-4'>
                                                <div className='w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-blue-600 font-bold'>
                                                    {shopOrder.assignedDeliveryBoy.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className='font-bold text-gray-800'>{shopOrder.assignedDeliveryBoy.fullName}</p>
                                                    <p className='text-sm text-gray-600 flex items-center gap-1'><MdPhone size={14} /> {shopOrder.assignedDeliveryBoy.mobile}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='bg-orange-50 p-6 rounded-2xl border border-orange-100 text-center'>
                                            <p className='text-orange-800 font-medium italic'>Waiting for delivery partner assignment...</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {shopOrder.assignedDeliveryBoy && shopOrder.status !== "delivered" && (
                                <div className='h-[400px] w-full'>
                                    <DeliveryBoyTracking 
                                        deliveryBoyLocation={liveLocations[shopOrder.assignedDeliveryBoy._id] || {
                                            lat: shopOrder.assignedDeliveryBoy.location.coordinates[1],
                                            lon: shopOrder.assignedDeliveryBoy.location.coordinates[0]
                                        }}
                                        customerLocation={{
                                            lat: currentOrder.deliveryAddress.latitude,
                                            lon: currentOrder.deliveryAddress.longitude
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default TrackOrderPage
