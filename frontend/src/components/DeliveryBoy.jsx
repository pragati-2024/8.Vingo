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
    const [availableAssignments, setAvailableAssignments] = useState([])
    const [showOtpBox, setShowOtpBox] = useState(false)
    const [otp, setOtp] = useState("")
    const [todayDeliveries, setTodayDeliveries] = useState([])
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [liveLocation, setLiveLocation] = useState(userData?.location?.coordinates || [0, 0]) // 🔥 Local live location

    const fetchInitialData = async () => {
        setLoading(true)
        try {
            // Fetch assignments
            const assignmentsRes = await axios.get(`${serverUrl}/api/order/assignments`, { withCredentials: true }).catch(err => ({ data: [] }))
            
            // 🔥 DUMMY DATA ADDED FOR TESTING
            const dummyRequest = {
                assignmentId: "dummy_123",
                orderId: "dummy_order_123",
                shopName: "Pizza Hut (Dummy)",
                deliveryAddress: {
                    text: "GLA University, Mathura",
                    latitude: 27.6057,
                    longitude: 77.5933
                },
                items: [{ name: "Cheese Pizza", quantity: 1, price: 350 }],
                subtotal: 350,
                isDummy: true
            };

            setAvailableAssignments(assignmentsRes.data.length > 0 ? assignmentsRes.data : [dummyRequest])

            // Fetch current order
            const currentOrderRes = await axios.get(`${serverUrl}/api/order/current`, { withCredentials: true }).catch(err => ({ data: null }))
            setCurrentOrder(currentOrderRes.data)

            // Fetch today deliveries
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

        const handleNewAssignment = (data) => {
            // Check if this assignment is already in the list
            setAvailableAssignments(prev => {
                const exists = prev.some(a => a.assignmentId === data.assignmentId)
                if (exists) return prev
                return [data, ...prev]
            })
        }

        socket.on('deliveryAvailable', handleNewAssignment)

        let watchId
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition((position) => {
                const { latitude, longitude } = position.coords
                setLiveLocation([longitude, latitude]) // 🔥 Update local state
                socket.emit('updateLocation', {
                    latitude,
                    longitude,
                    userId: userData._id
                })
            }, (error) => console.error(error), { enableHighAccuracy: true })
        }

        return () => {
            socket.off('deliveryAvailable', handleNewAssignment)
            if (watchId) navigator.geolocation.clearWatch(watchId)
        }
    }, [socket, userData])

    const handleAccept = async (assignmentId, isDummy = false) => {
        if (isDummy) {
            setCurrentOrder({
                _id: "dummy_order_123",
                user: { fullName: "Dummy User", mobile: "9876543210" },
                shopOrder: {
                    _id: "dummy_shop_order_123",
                    shopOrderItems: [{ name: "Cheese Pizza", quantity: 1, price: 350 }],
                    subtotal: 350,
                    status: "out of delivery"
                },
                deliveryAddress: {
                    text: "GLA University, Mathura",
                    latitude: 27.6057,
                    longitude: 77.5933
                },
                isDummy: true
            });
            setAvailableAssignments([]);
            return;
        }
        try {
            await axios.post(`${serverUrl}/api/order/accept/${assignmentId}`, {}, { withCredentials: true })
            setAvailableAssignments(prev => prev.filter(a => a.assignmentId !== assignmentId))
            const res = await axios.get(`${serverUrl}/api/order/current`, { withCredentials: true })
            setCurrentOrder(res.data)
        } catch (error) {
            alert(error.response?.data?.message || "Error accepting order")
        }
    }

    const handleSendOtp = async () => {
        try {
            setMessage("Sending OTP...")
            await axios.post(`${serverUrl}/api/order/send-otp`, {
                orderId: currentOrder._id,
                shopOrderId: currentOrder.shopOrder._id
            }, { withCredentials: true })
            setShowOtpBox(true)
            setMessage("OTP sent to customer's email!")
        } catch (error) {
            setMessage("Error sending OTP")
        }
    }

    const handleVerifyOtp = async () => {
        if (currentOrder?.isDummy) {
            if (otp === "1234") {
                setCurrentOrder(null);
                setShowOtpBox(false);
                setOtp("");
                setMessage("Dummy Order Delivered Successfully! (OTP: 1234)");
                return;
            } else {
                alert("Invalid Dummy OTP. Use 1234");
                return;
            }
        }
        try {
            await axios.post(`${serverUrl}/api/order/verify-otp`, {
                orderId: currentOrder._id,
                shopOrderId: currentOrder.shopOrder._id,
                otp
            }, { withCredentials: true })
            setCurrentOrder(null)
            setShowOtpBox(false)
            setOtp("")
            setMessage("Order delivered successfully!")
            fetchInitialData()
        } catch (error) {
            alert(error.response?.data?.message || "Invalid OTP")
        }
    }

    if (loading) return <div className='h-screen flex items-center justify-center'><ClipLoader color="#ff4d2d" /></div>

    return (
        <div className='w-full min-h-screen flex flex-col items-center'>
            {/* Dark Hero Section with Restored Background Image */}
            <div className="w-full h-[55vh] md:h-[65vh] relative flex flex-col items-center justify-center text-white overflow-hidden">
                {/* Background Image with Dark Overlay */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2070" 
                        className="w-full h-full object-cover" 
                        alt="Delivery BG" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-[#f8f9fb]"></div>
                </div>

                <div className="z-10 flex flex-col items-center text-center px-4 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="mb-6 bg-white/10 backdrop-blur-xl p-6 rounded-full border border-white/20 shadow-2xl"
                    >
                        <FaMotorcycle className="text-6xl text-[#ff4d2d] drop-shadow-[0_0_15px_rgba(255,77,45,0.8)]" />
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-6xl md:text-8xl font-black tracking-tighter mb-4 uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-white"
                    >
                        Delivery <span className="text-[#ff4d2d]">Panel</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="max-w-2xl text-white font-black text-lg md:text-xl uppercase tracking-[0.3em] drop-shadow-lg"
                    >
                        Earn while you ride. Track orders & monitor growth.
                    </motion.p>
                </div>
            </div>

            {/* Light Content Sections */}
            <div className="w-full -mt-16 z-10 pb-20 flex flex-col items-center subtle-star-pattern pt-10 bg-white/95 backdrop-blur-[2px]">
                <div className='w-full max-w-4xl px-4'>
                    {message && <div className='bg-orange-100 text-orange-700 p-3 rounded-lg mb-4 text-center font-medium shadow-sm'>{message}</div>}

                    {currentOrder ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className='bg-white rounded-[40px] shadow-2xl p-8 md:p-12 border border-gray-100 relative overflow-hidden'
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <span className="bg-orange-50 text-[#ff4d2d] px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border border-orange-100">Active Delivery</span>
                            </div>
                            
                            <h2 className='text-3xl font-black text-gray-900 mb-10 flex items-center gap-4 uppercase tracking-tighter'>
                                <FaMotorcycle className="text-[#ff4d2d]" /> Current Mission
                            </h2>
                            
                            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
                                <div className="space-y-10">
                                    <div className="flex gap-6">
                                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-[#ff4d2d] shadow-sm border border-gray-100">
                                            <FaUser size={24} />
                                        </div>
                                        <div>
                                            <p className='text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1'>Customer</p>
                                            <p className='text-2xl font-black text-gray-900'>{currentOrder.user.fullName}</p>
                                            <a href={`tel:${currentOrder.user.mobile}`} className='text-[#ff4d2d] font-bold text-sm flex items-center gap-2 mt-1 hover:underline'>
                                                <FaPhoneAlt size={12} /> {currentOrder.user.mobile}
                                            </a>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-6">
                                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-[#ff4d2d] shadow-sm border border-gray-100">
                                            <FaMapMarkerAlt size={24} />
                                        </div>
                                        <div>
                                            <p className='text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1'>Destination</p>
                                            <p className='text-gray-700 font-bold leading-relaxed max-w-sm'>{currentOrder.deliveryAddress.text}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className='bg-[#f8f9fb] p-8 rounded-[32px] border border-gray-100 shadow-inner relative'>
                                    <div className="absolute -top-4 -right-4 bg-white p-3 rounded-2xl shadow-lg border border-gray-50">
                                        <FaUtensils className="text-[#ff4d2d]" />
                                    </div>
                                    <p className='text-[10px] text-gray-400 uppercase font-black tracking-widest mb-6'>Order Manifest</p>
                                    <div className='space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar'>
                                        {currentOrder.shopOrder.shopOrderItems.map((item, idx) => (
                                            <div key={idx} className='flex justify-between items-center text-sm font-bold text-gray-700 bg-white p-4 rounded-2xl shadow-sm border border-gray-100'>
                                                <span>{item.name} <span className='text-[#ff4d2d] ml-2'>x{item.quantity}</span></span>
                                                <span className='text-gray-900'>₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className='mt-10 pt-6 border-t-4 border-white flex justify-between items-center'>
                                        <span className='text-xs font-black text-gray-400 uppercase tracking-[0.2em]'>Total Earnings</span>
                                        <span className='text-3xl font-black text-[#ff4d2d]'>₹{currentOrder.shopOrder.subtotal}</span>
                                    </div>
                                </div>
                            </div>

                            <div className='mt-12'>
                                {!showOtpBox ? (
                                    <motion.button 
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSendOtp}
                                        className='w-full bg-gradient-to-r from-[#ff4d2d] to-[#ff7d2d] text-white py-6 rounded-3xl font-black text-xl shadow-[0_20px_40px_rgba(255,77,45,0.3)] hover:shadow-[0_25px_50px_rgba(255,77,45,0.4)] transition-all uppercase tracking-widest flex items-center justify-center gap-4'
                                    >
                                        <FaCheckCircle /> Confirm Arrival & Send OTP
                                    </motion.button>
                                ) : (
                                    <div className='flex flex-col gap-6 bg-orange-50/50 p-8 rounded-[32px] border border-orange-100'>
                                        <p className="text-center text-orange-800 font-black uppercase tracking-widest text-xs">Verify Delivery OTP</p>
                                        <div className="flex gap-4">
                                            <input 
                                                type="text" 
                                                placeholder="Enter OTP" 
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className='flex-1 bg-white px-8 py-5 rounded-2xl border-2 border-orange-200 text-center text-3xl font-black text-[#ff4d2d] focus:outline-none focus:border-[#ff4d2d] shadow-inner tracking-[0.5em]'
                                            />
                                            <button 
                                                onClick={handleVerifyOtp}
                                                className='bg-[#ff4d2d] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-orange-600 transition-all'
                                            >
                                                Verify
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <div className='space-y-10'>
                            <div className='flex items-center justify-between border-b border-gray-100 pb-6'>
                                <div>
                                    <h2 className='text-3xl font-black text-gray-900 uppercase tracking-tighter'>Available Gigs</h2>
                                    <p className='text-gray-400 font-bold text-xs uppercase tracking-widest mt-1'>Nearby orders waiting for you</p>
                                </div>
                                <div className='bg-orange-50 text-[#ff4d2d] px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border border-orange-100 flex items-center gap-2'>
                                    <div className="w-2 h-2 rounded-full bg-[#ff4d2d] animate-pulse" />
                                    {availableAssignments.length} Nearby
                                </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <AnimatePresence>
                                    {availableAssignments.length > 0 ? (
                                        availableAssignments.map((assignment) => (
                                            <motion.div 
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                key={assignment.assignmentId} 
                                                className='bg-white rounded-[32px] p-6 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-2xl transition-all duration-500 group relative overflow-hidden'
                                            >
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/50 rounded-bl-[100px] -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                                                
                                                <div className='relative z-10'>
                                                    <div className='flex justify-between items-start mb-6'>
                                                        <div className='flex items-center gap-3'>
                                                            <div className='w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#ff4d2d] border border-gray-100'>
                                                                <FaUtensils size={18} />
                                                            </div>
                                                            <div>
                                                                <h3 className='text-lg font-black text-gray-900 uppercase tracking-tighter'>{assignment.shopName}</h3>
                                                                <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Restaurant</p>
                                                            </div>
                                                        </div>
                                                        <div className='text-right'>
                                                            <p className='text-2xl font-black text-[#ff4d2d]'>₹{assignment.subtotal || 50}</p>
                                                            <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Earnings</p>
                                                        </div>
                                                    </div>

                                                    <div className='space-y-4 mb-8'>
                                                        <div className='flex gap-3'>
                                                            <FaMapMarkerAlt className='text-gray-300 mt-1 flex-shrink-0' size={14} />
                                                            <p className='text-sm font-bold text-gray-600 line-clamp-2 leading-relaxed'>{assignment.deliveryAddress.text}</p>
                                                        </div>
                                                    </div>

                                                    <motion.button 
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => handleAccept(assignment.assignmentId, assignment.isDummy)}
                                                        className='w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl group-hover:bg-[#ff4d2d] transition-all flex items-center justify-center gap-2'
                                                    >
                                                        <MdDeliveryDining size={20} /> Accept Delivery
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className='col-span-full py-20 bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center'>
                                            <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm'>
                                                <FaMotorcycle className='text-gray-200 text-4xl' />
                                            </div>
                                            <p className='text-gray-400 font-black uppercase tracking-widest text-sm'>Waiting for new orders...</p>
                                            <p className='text-gray-300 font-bold text-[10px] uppercase tracking-[0.2em] mt-2'>Stay active on this screen to receive gigs</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 pt-10'>
                                <div className='bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm'>
                                    <div className='flex items-center gap-4 mb-4'>
                                        <div className='w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center'><FaChartLine /></div>
                                        <h4 className='font-black uppercase tracking-tighter text-gray-900'>Today's Stats</h4>
                                    </div>
                                    <p className='text-3xl font-black text-gray-900'>{todayDeliveries.length}</p>
                                    <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Deliveries Done</p>
                                </div>
                                <div className='bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm'>
                                    <div className='flex items-center gap-4 mb-4'>
                                        <div className='w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center'><FaHistory /></div>
                                        <h4 className='font-black uppercase tracking-tighter text-gray-900'>Total Earned</h4>
                                    </div>
                                    <p className='text-3xl font-black text-gray-900'>₹{todayDeliveries.reduce((acc, curr) => acc + (curr.shopOrder?.subtotal || 50), 0)}</p>
                                    <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Today's Revenue</p>
                                </div>
                                <div className='bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm'>
                                    <div className='flex items-center gap-4 mb-4'>
                                        <div className='w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center'><FaUser /></div>
                                        <h4 className='font-black uppercase tracking-tighter text-gray-900'>Rating</h4>
                                    </div>
                                    <p className='text-3xl font-black text-gray-900'>4.9</p>
                                    <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Customer Rating</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DeliveryBoy
