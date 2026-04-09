import React, { useState, useEffect } from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import DeliveryBoyTracking from './DeliveryBoyTracking'
import { ClipLoader } from 'react-spinners'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { FaMotorcycle, FaMapMarkerAlt, FaUser, FaPhoneAlt, FaCheckCircle, FaChartLine, FaHistory, FaUtensils } from 'react-icons/fa'
import { MdDeliveryDining } from 'react-icons/md'

function DeliveryBoy() {
    const { userData, socket } = useSelector(state => state.user)
    const [currentOrder, setCurrentOrder] = useState(null)
    const [availableOrders, setAvailableOrders] = useState([])
    const [showOtpBox, setShowOtpBox] = useState(false)
    const [otp, setOtp] = useState("")
    const [todayDeliveries, setTodayDeliveries] = useState([])
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [liveLocation, setLiveLocation] = useState(userData?.location?.coordinates || [0, 0])

    const fetchInitialData = async () => {
        setLoading(true)
        try {
            const ordersRes = await axios.get(`${serverUrl}/api/order/available`, { withCredentials: true })
            setAvailableOrders(ordersRes.data)

            const currentOrderRes = await axios.get(`${serverUrl}/api/order/current/delivery`, { withCredentials: true }).catch(err => ({ data: null }))
            setCurrentOrder(currentOrderRes.data)

            const deliveriesRes = await axios.get(`${serverUrl}/api/order/today-deliveries`, { withCredentials: true }).catch(err => ({ data: [] }))
            setTodayDeliveries(deliveriesRes.data)
        } catch (error) {
            console.error("Fetch initial data error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (userData?.role === "deliveryBoy") {
            fetchInitialData()
        }
    }, [userData])

    useEffect(() => {
        if (!socket || userData.role !== "deliveryBoy") return

        const handleNewOrder = (data) => {
            setAvailableOrders(prev => {
                const exists = prev.some(a => a._id === data._id)
                if (exists) return prev
                return [data, ...prev]
            })
        }

        const handleOrderTaken = (orderId) => {
            setAvailableOrders(prev => prev.filter(a => a._id !== orderId))
        }

        const handleAssignedOrder = (data) => {
            setCurrentOrder(data)
            setMessage("You've been assigned an active mission!")
            setTimeout(() => setMessage(""), 3000)
        }

        socket.on('newOrder', handleNewOrder)
        socket.on('orderTaken', handleOrderTaken)
        socket.on('assignedOrder', handleAssignedOrder)

        let watchId
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition((position) => {
                const { latitude, longitude } = position.coords
                setLiveLocation([longitude, latitude])
                socket.emit('updateLocation', {
                    latitude,
                    longitude,
                    userId: userData._id,
                    orderId: currentOrder?._id
                })
            }, (error) => console.error(error), { enableHighAccuracy: true })
        }

        return () => {
            socket.off('newOrder', handleNewOrder)
            socket.off('orderTaken', handleOrderTaken)
            socket.off('assignedOrder', handleAssignedOrder)
            if (watchId) navigator.geolocation.clearWatch(watchId)
        }
    }, [socket, userData, currentOrder])

    const handleAccept = async (orderId) => {
        try {
            const res = await axios.post(`${serverUrl}/api/order/accept`, { orderId }, { withCredentials: true })
            setCurrentOrder(res.data.order)
            setAvailableOrders(prev => prev.filter(a => a._id !== orderId))
            setMessage("Order accepted successfully!")
            setTimeout(() => setMessage(""), 3000)
        } catch (error) {
            setMessage(error.response?.data?.message || "Accept error")
            setTimeout(() => setMessage(""), 3000)
        }
    }

    const updateStatus = async (status) => {
        try {
            const res = await axios.put(`${serverUrl}/api/order/status`, { 
                orderId: currentOrder._id, 
                status 
            }, { withCredentials: true })
            setCurrentOrder(res.data.order)
            setMessage(`Status updated to ${status}`)
            setTimeout(() => setMessage(""), 3000)
        } catch (error) {
            console.error(error)
        }
    }

    const sendOtp = async () => {
        try {
            await axios.post(`${serverUrl}/api/order/send-otp`, { orderId: currentOrder._id }, { withCredentials: true })
            setShowOtpBox(true)
            setMessage("OTP sent to customer")
            setTimeout(() => setMessage(""), 3000)
        } catch (error) {
            setMessage("Error sending OTP")
            setTimeout(() => setMessage(""), 3000)
        }
    }

    const verifyOtp = async () => {
        try {
            await axios.post(`${serverUrl}/api/order/verify-otp`, { orderId: currentOrder._id, otp }, { withCredentials: true })
            setCurrentOrder(null)
            setShowOtpBox(false)
            setOtp("")
            fetchInitialData()
            setMessage("Order delivered successfully!")
            setTimeout(() => setMessage(""), 3000)
        } catch (error) {
            setMessage("Invalid OTP")
            setTimeout(() => setMessage(""), 3000)
        }
    }

    if (userData?.role !== "deliveryBoy") return <div>Access Denied</div>

    return (
        <div className="w-full min-h-screen bg-[#fffcf8] font-['Outfit'] pb-10">
            
            {/* 🏍️ HERO SECTION (DELIVERY PANEL) */}
            <div className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden mb-12">
                <div className="absolute inset-0 bg-black/60 z-10"></div>
                <img 
                    src="/delivery_bg.png" 
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Delivery Background"
                />
                <div className="relative z-20 h-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-[#ff4d2d] rounded-full flex items-center justify-center text-white mb-6 shadow-2xl shadow-[#ff4d2d]/40 border-4 border-white/20"
                    >
                        <FaMotorcycle size={40} />
                    </motion.div>
                    <motion.h1 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-4"
                    >
                        DELIVERY <span className="text-[#ff4d2d]">PANEL</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-white/80 font-black uppercase tracking-[0.3em] text-sm md:text-base max-w-2xl"
                    >
                        EARN WHILE YOU RIDE. TRACK ORDERS & MONITOR GROWTH.
                    </motion.p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* 🛵 PARTNER INFO HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Vingo</h2>
                            <span className="bg-[#ff4d2d]/10 text-[#ff4d2d] px-3 py-1 rounded-xl text-xs font-black uppercase tracking-widest">Partner</span>
                        </div>
                        <p className="text-gray-500 font-medium">Welcome back, <span className="text-gray-900 font-bold capitalize">{userData.fullName}!</span></p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 px-6">
                        <div className={`w-3 h-3 rounded-full ${userData.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                        <span className="font-black text-gray-700 uppercase tracking-widest text-xs">
                            {userData.isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>

                <AnimatePresence>
                    {message && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 border border-white/10"
                        >
                            <FaCheckCircle className="text-[#ff4d2d]" /> {message}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* 🚀 LEFT COLUMN: MAIN WORKFLOW */}
                    <div className="lg:col-span-8 space-y-12">
                        
                        {/* 🎯 ACTIVE MISSION */}
                        {currentOrder ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100"
                            >
                                <div className="p-8 border-b border-gray-100 bg-[#fffcf8] flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gray-900 p-4 rounded-2xl text-white">
                                            <FaMotorcycle className="text-2xl" />
                                        </div>
                                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Active Mission</h2>
                                    </div>
                                    <div className="bg-[#ff4d2d]/10 text-[#ff4d2d] px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                                        In Progress
                                    </div>
                                </div>

                                <div className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                                <div className="bg-white p-3 rounded-xl shadow-sm text-gray-400">
                                                    <FaUser />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                                                    <h3 className="text-xl font-black text-gray-900">{currentOrder.user?.fullName}</h3>
                                                    <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                                                        <FaPhoneAlt size={12} /> {currentOrder.user?.mobile}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                                <div className="bg-white p-3 rounded-xl shadow-sm text-[#ff4d2d]">
                                                    <FaMapMarkerAlt />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Destination</p>
                                                    <p className="text-gray-900 font-bold leading-tight">{currentOrder.deliveryAddress?.text}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4d2d]/20 rounded-full blur-3xl"></div>
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Order Manifest</h3>
                                            <div className="space-y-4">
                                                {currentOrder.shopOrders.map((so) => (
                                                    so.shopOrderItems.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-black text-[#ff4d2d]">{item.quantity}x</span>
                                                                <span className="font-bold text-sm text-white/90">{item.name}</span>
                                                            </div>
                                                            <span className="font-black">₹{item.price}</span>
                                                        </div>
                                                    ))
                                                ))}
                                            </div>
                                            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Earnings</span>
                                                <span className="text-3xl font-black text-[#ff4d2d]">₹{currentOrder.totalAmount}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 h-[400px] rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl relative">
                                        <DeliveryBoyTracking 
                                            deliveryBoyLocation={liveLocation}
                                            customerLocation={[currentOrder.deliveryAddress?.longitude, currentOrder.deliveryAddress?.latitude]}
                                        />
                                    </div>

                                    <div className="mt-10 flex flex-col sm:flex-row gap-4">
                                        {currentOrder.shopOrders[0].status === 'accepted' && (
                                            <button 
                                                onClick={() => updateStatus("out of delivery")}
                                                className="flex-1 bg-gray-900 text-white py-6 rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3"
                                            >
                                                <MdDeliveryDining className="text-3xl" /> Start Delivery
                                            </button>
                                        )}
                                        {currentOrder.shopOrders[0].status === 'out of delivery' && !showOtpBox && (
                                            <button 
                                                onClick={sendOtp}
                                                className="flex-1 bg-[#ff4d2d] text-white py-6 rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl shadow-[#ff4d2d]/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                                            >
                                                <FaCheckCircle className="text-3xl" /> Confirm Arrival
                                            </button>
                                        )}
                                    </div>

                                    {showOtpBox && (
                                        <motion.div 
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            className="mt-8 bg-[#fffcf8] p-8 rounded-[2.5rem] border-2 border-orange-100"
                                        >
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 text-center">Customer Verification Code</label>
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <input 
                                                    type="text" 
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    placeholder="XXXX"
                                                    className="flex-1 bg-white border-4 border-gray-100 rounded-[1.5rem] px-8 py-5 text-center text-4xl font-black tracking-[0.5em] focus:outline-none focus:border-[#ff4d2d] transition-all"
                                                />
                                                <button 
                                                    onClick={verifyOtp}
                                                    className="bg-gray-900 text-white px-12 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-black transition-all"
                                                >
                                                    Verify
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            /* 📢 AVAILABLE GIGS */
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-4">
                                        Available Gigs
                                        {availableOrders.length > 0 && (
                                            <span className="bg-[#ff4d2d] text-white text-[10px] px-3 py-1 rounded-full animate-pulse tracking-widest">
                                                {availableOrders.length} NEARBY
                                            </span>
                                        )}
                                    </h2>
                                </div>

                                {availableOrders.length === 0 ? (
                                    <div className="bg-white rounded-[3rem] p-20 text-center border-4 border-dashed border-gray-100">
                                        <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <MdDeliveryDining className="text-5xl text-gray-200" />
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 mb-2">Scanning for Gigs...</h3>
                                        <p className="text-gray-400 font-medium">New delivery requests will appear here in real-time.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {availableOrders.map((order) => (
                                            <motion.div 
                                                key={order._id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 hover:border-[#ff4d2d]/50 transition-all group"
                                            >
                                                <div className="flex justify-between items-start mb-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-orange-50 p-4 rounded-2xl group-hover:bg-[#ff4d2d] group-hover:text-white transition-all">
                                                            <FaUtensils size={24} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-black text-gray-900 uppercase leading-none mb-1">{order.shopOrders[0]?.shop?.name}</h3>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Restaurant</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-3xl font-black text-[#ff4d2d]">₹{order.totalAmount}</p>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Earnings</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-3 text-gray-500 font-medium mb-8 bg-gray-50 p-4 rounded-2xl">
                                                    <FaMapMarkerAlt className="text-[#ff4d2d]" />
                                                    <span className="text-xs truncate font-bold">{order.deliveryAddress?.text}</span>
                                                </div>

                                                <button 
                                                    onClick={() => handleAccept(order._id)}
                                                    className="w-full bg-gray-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl group-hover:bg-[#ff4d2d] transition-all flex items-center justify-center gap-3"
                                                >
                                                    <FaMotorcycle size={20} /> Accept Delivery
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 📊 RIGHT COLUMN: STATS */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-100">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                                <FaChartLine className="text-[#ff4d2d]" /> Performance
                            </h2>
                            <div className="space-y-4">
                                <div className="p-6 bg-[#fffcf8] rounded-[2rem] border border-orange-50">
                                    <p className="text-4xl font-black text-gray-900">{todayDeliveries.length}</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Today's Missions</p>
                                </div>
                                <div className="p-6 bg-[#fffcf8] rounded-[2rem] border border-orange-50">
                                    <p className="text-4xl font-black text-[#ff4d2d]">₹{todayDeliveries.reduce((sum, d) => sum + d.totalAmount, 0)}</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Daily Revenue</p>
                                </div>
                                <div className="p-6 bg-[#fffcf8] rounded-[2rem] border border-orange-50">
                                    <div className="flex items-center gap-2">
                                        <p className="text-4xl font-black text-gray-900">4.9</p>
                                        <span className="text-orange-400 text-xl">★★★★★</span>
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pilot Rating</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-100">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                                <FaHistory className="text-[#ff4d2d]" /> Recent Logs
                            </h2>
                            <div className="space-y-4">
                                {todayDeliveries.slice(0, 5).map((d, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div>
                                            <p className="font-black text-gray-900 text-sm">MISSION #{d._id.slice(-6).toUpperCase()}</p>
                                            <p className="text-[10px] text-gray-400 font-black uppercase">{new Date(d.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                        <p className="font-black text-green-600">₹{d.totalAmount}</p>
                                    </div>
                                ))}
                                {todayDeliveries.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400 font-medium text-sm">No logs recorded today</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DeliveryBoy
