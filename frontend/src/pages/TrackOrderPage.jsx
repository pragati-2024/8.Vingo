import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { IoIosArrowRoundBack } from "react-icons/io"
import { MdPhone, MdLocationOn } from "react-icons/md"
import { motion, AnimatePresence } from 'framer-motion'
import { FaMotorcycle, FaMapMarkerAlt, FaUser, FaCheckCircle } from 'react-icons/fa'

import { serverUrl } from '../App'
import DeliveryBoyTracking from '../components/DeliveryBoyTracking'

function TrackOrderPage() {
    const { orderId } = useParams()
    const [currentOrder, setCurrentOrder] = useState(null) 
    const navigate = useNavigate()
    const { socket } = useSelector(state => state.user)
    const [liveLocation, setLiveLocation] = useState(null)
    const [retryLoading, setRetryLoading] = useState(false)
    const [retryMessage, setRetryMessage] = useState("")

    const handleGetOrder = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/order/${orderId}`, { withCredentials: true })
            setCurrentOrder(result.data)
            if (result.data.deliveryBoy?.location?.coordinates) {
                setLiveLocation({
                    lat: result.data.deliveryBoy.location.coordinates[1],
                    lon: result.data.deliveryBoy.location.coordinates[0]
                })
            }
        } catch (error) {
            console.error("Fetch order error:", error)
        }
    }

    const handleRetryBroadcast = async () => {
        setRetryLoading(true)
        setRetryMessage("")
        try {
            const res = await axios.post(`${serverUrl}/api/order/retry-broadcast`, { orderId }, { withCredentials: true })
            setRetryMessage("Broadcast retried!")
            setTimeout(() => setRetryMessage(""), 3000)
        } catch (error) {
            setRetryMessage(error.response?.data?.message || "Retry failed")
            setTimeout(() => setRetryMessage(""), 3000)
        } finally {
            setRetryLoading(false)
        }
    }

    useEffect(() => {
        handleGetOrder()
    }, [orderId])

    useEffect(() => {
        if (socket && orderId) {
            socket.emit('joinOrder', orderId)

            const handleUpdateLocation = (data) => {
                if (data.orderId === orderId) {
                    setLiveLocation({ lat: data.latitude, lon: data.longitude })
                }
            }

            const handleStatusUpdate = ({ orderId: updatedOrderId, status }) => {
                if (updatedOrderId === orderId) {
                    handleGetOrder()
                }
            }

            const handleOrderAccepted = (updatedOrder) => {
                if (updatedOrder._id === orderId) {
                    setCurrentOrder(updatedOrder)
                }
            }

            socket.on('deliveryLocationUpdate', handleUpdateLocation)
            socket.on('orderStatusUpdated', handleStatusUpdate)
            socket.on('orderAccepted', handleOrderAccepted)

            return () => {
                socket.off('deliveryLocationUpdate', handleUpdateLocation)
                socket.off('orderStatusUpdated', handleStatusUpdate)
                socket.off('orderAccepted', handleOrderAccepted)
            }
        }
    }, [socket, orderId])

    if (!currentOrder) return (
        <div className='h-screen flex flex-col items-center justify-center bg-[#fffcf8]'>
            <div className='w-16 h-16 border-4 border-[#ff4d2d] border-t-transparent rounded-full animate-spin mb-4'></div>
            <p className='text-gray-500 font-bold'>Loading mission details...</p>
        </div>
    )

    const orderStatus = currentOrder.shopOrders[0]?.status || "pending"

    return (
        <div className='min-h-screen bg-[#fffcf8] pb-12 font-["Outfit"]'>
            <div className='max-w-5xl mx-auto px-4'>
                {/* 🔙 BACK NAV */}
                <div className='flex items-center gap-4 py-8 cursor-pointer group' onClick={() => navigate("/my-orders")}>
                    <div className='bg-white p-2 rounded-xl shadow-sm border border-gray-100 group-hover:bg-[#ff4d2d] group-hover:text-white transition-all'>
                        <IoIosArrowRoundBack size={30} />
                    </div>
                    <h1 className='text-3xl font-black text-gray-900 tracking-tighter'>Track Order</h1>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
                    {/* 🗺️ MAP SECTION */}
                    <div className='lg:col-span-8'>
                        <div className='bg-white rounded-[2.5rem] shadow-2xl shadow-orange-100/50 overflow-hidden border-8 border-white h-[500px] relative'>
                            {liveLocation ? (
                                <DeliveryBoyTracking 
                                    deliveryBoyLocation={liveLocation}
                                    customerLocation={[currentOrder.deliveryAddress?.longitude, currentOrder.deliveryAddress?.latitude]}
                                />
                            ) : (
                                <div className='w-full h-full bg-gray-50 flex flex-col items-center justify-center p-12 text-center'>
                                    <div className='bg-white p-6 rounded-full shadow-xl mb-6'>
                                        <FaMotorcycle className='text-5xl text-gray-200 animate-bounce' />
                                    </div>
                                    <h3 className='text-xl font-black text-gray-900 mb-2 uppercase tracking-tight'>Waiting for Assignment</h3>
                                    <p className='text-gray-400 font-medium max-w-xs mb-6'>We're finding the best delivery partner for your order. Hang tight!</p>
                                    
                                    <div className='bg-orange-50 border border-orange-100 rounded-2xl p-6 max-w-sm'>
                                        <p className='text-orange-800 font-bold text-sm mb-4'>Broadcast Failed (No Delivery Boy Found)</p>
                                        <button 
                                            onClick={handleRetryBroadcast}
                                            disabled={retryLoading}
                                            className='bg-[#ff4d2d] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50'
                                        >
                                            {retryLoading ? "Retrying..." : "Try Broadcast Again"}
                                        </button>
                                        {retryMessage && <p className='mt-3 text-xs font-bold text-orange-600 uppercase tracking-widest'>{retryMessage}</p>}
                                        <p className='text-[10px] text-gray-400 font-medium mt-4 italic'>Waiting for a delivery boy to accept the order...</p>
                                    </div>
                                </div>
                            )}

                            {/* STATUS OVERLAY */}
                            <div className='absolute top-6 left-6 right-6 z-[1000]'>
                                <div className='bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white flex items-center justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <div className={`w-3 h-3 rounded-full animate-pulse ${orderStatus === 'delivered' ? 'bg-green-500' : 'bg-[#ff4d2d]'}`}></div>
                                        <span className='font-black text-gray-900 uppercase tracking-widest text-xs'>{orderStatus}</span>
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none'>Estimated Arrival</p>
                                        <p className='text-lg font-black text-[#ff4d2d]'>15-20 MINS</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 📦 ORDER DETAILS SIDEBAR */}
                    <div className='lg:col-span-4 space-y-6'>
                        {/* PARTNER INFO */}
                        <div className='bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100'>
                            <h3 className='text-xs font-black text-gray-400 uppercase tracking-widest mb-4'>Delivery Partner</h3>
                            {currentOrder.deliveryBoy ? (
                                <div className='flex items-center gap-4'>
                                    <div className='w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-[#ff4d2d]'>
                                        <FaUser size={24} />
                                    </div>
                                    <div>
                                        <h4 className='font-black text-gray-900'>{currentOrder.deliveryBoy.fullName}</h4>
                                        <p className='text-xs font-bold text-[#ff4d2d] flex items-center gap-1 mt-1'>
                                            <FaCheckCircle size={10} /> VERIFIED PARTNER
                                        </p>
                                    </div>
                                    <a href={`tel:${currentOrder.deliveryBoy.mobile}`} className='ml-auto bg-gray-900 text-white p-3 rounded-xl hover:scale-110 transition-transform'>
                                        <MdPhone size={20} />
                                    </a>
                                </div>
                            ) : (
                                <div className='flex items-center gap-4 opacity-50'>
                                    <div className='w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400'>
                                        <FaUser size={24} />
                                    </div>
                                    <p className='text-sm font-bold text-gray-500'>Finding partner...</p>
                                </div>
                            )}
                        </div>

                        {/* ORDER ITEMS */}
                        <div className='bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100'>
                            <h3 className='text-xs font-black text-gray-400 uppercase tracking-widest mb-4'>Order Items</h3>
                            <div className='space-y-3'>
                                {currentOrder.shopOrders.map((so) => (
                                    so.shopOrderItems.map((item, idx) => (
                                        <div key={idx} className='flex justify-between items-center bg-[#fffcf8] p-3 rounded-xl border border-orange-50'>
                                            <span className='text-sm font-bold text-gray-700'>{item.name} <span className='text-[#ff4d2d]'>x{item.quantity}</span></span>
                                            <span className='text-sm font-black text-gray-900'>₹{item.price * item.quantity}</span>
                                        </div>
                                    ))
                                ))}
                            </div>
                            <div className='mt-6 pt-6 border-t border-dashed border-gray-200 flex justify-between items-center'>
                                <span className='text-xs font-black text-gray-400 uppercase tracking-widest'>Total Paid</span>
                                <span className='text-xl font-black text-gray-900'>₹{currentOrder.totalAmount}</span>
                            </div>
                        </div>

                        {/* ADDRESS */}
                        <div className='bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100'>
                            <h3 className='text-xs font-black text-gray-400 uppercase tracking-widest mb-3'>Delivery Destination</h3>
                            <div className='flex items-start gap-3'>
                                <div className='bg-red-50 p-2 rounded-lg text-[#ff4d2d]'>
                                    <MdLocationOn size={20} />
                                </div>
                                <p className='text-sm font-bold text-gray-600 leading-relaxed'>{currentOrder.deliveryAddress?.text}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TrackOrderPage