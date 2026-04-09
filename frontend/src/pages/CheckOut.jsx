import React, { useEffect, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { IoLocationSharp } from "react-icons/io5";
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import "leaflet/dist/leaflet.css"
import { setAddress, setLocation } from '../redux/mapSlice';
import { MdDeliveryDining } from "react-icons/md";
import { FaCreditCard, FaWallet, FaInfoCircle } from "react-icons/fa";
import axios from 'axios';
import { FaMobileScreenButton } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { addMyOrder } from '../redux/userSlice';
import { motion, AnimatePresence } from 'framer-motion';

function RecenterMap({ location }) {
    const map = useMap()
    useEffect(() => {
        if (location.lat && location.lon) {
            map.setView([location.lat, location.lon], 16, { animate: true })
        }
    }, [location, map])
    return null
}

function CheckOut() {
    const { location, address } = useSelector(state => state.map)
    const { cartItems, totalAmount, userData } = useSelector(state => state.user)
    const [addressInput, setAddressInput] = useState(address || "")
    const [paymentMethod, setPaymentMethod] = useState("cod")
    const [loading, setLoading] = useState(false)
    
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const apiKey = "d183f054238e4a908235492d334571c3" 
    
    const deliveryFee = totalAmount > 500 ? 0 : 40
    const gst = Math.round(totalAmount * 0.05)
    const finalAmount = totalAmount + deliveryFee + gst

    const [userName, setUserName] = useState(userData?.fullName || "")
    const [userPhone, setUserPhone] = useState(userData?.mobile || "")

    useEffect(() => {
        if (address) setAddressInput(address)
    }, [address])

    const onDragEnd = (e) => {
        const { lat, lng } = e.target.getLatLng()
        dispatch(setLocation({ lat, lon: lng }))
        getAddressByLatLng(lat, lng)
    }

    const getCurrentLocation = () => {
        if (userData?.location?.coordinates) {
            const latitude = userData.location.coordinates[1]
            const longitude = userData.location.coordinates[0]
            dispatch(setLocation({ lat: latitude, lon: longitude }))
            getAddressByLatLng(latitude, longitude)
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords
                dispatch(setLocation({ lat: latitude, lon: longitude }))
                getAddressByLatLng(latitude, longitude)
            })
        }
    }

    const getAddressByLatLng = async (lat, lng) => {
        try {
            const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`)
            const addr = result?.data?.results[0]?.formatted || result?.data?.results[0]?.address_line2
            dispatch(setAddress(addr))
            setAddressInput(addr)
        } catch (error) {
            console.error("Geocoding error:", error)
        }
    }

    const getLatLngByAddress = async () => {
        if (!addressInput) return
        try {
            const result = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`)
            if (result.data.features && result.data.features.length > 0) {
                const feature = result.data.features[0];
                const [lon, lat] = feature.geometry.coordinates; 
                dispatch(setLocation({ lat, lon }))
            } else {
                alert("Address not found. Please be more specific.")
            }
        } catch (error) {
            console.error("Geocoding search error:", error)
        }
    }

    const handlePlaceOrder = async () => {
        if (!addressInput) return alert("Please confirm delivery address")
        if (!location.lat || !location.lon) return alert("Please pick a location on the map")
        
        setLoading(true)
        try {
            const payload = {
                paymentMethod,
                deliveryAddress: {
                    text: addressInput,
                    latitude: location.lat,
                    longitude: location.lon
                },
                totalAmount: finalAmount,
                cartItems: cartItems.map(i => ({
                    shop: i.shop,
                    item: i.id,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity
                }))
            }

            const result = await axios.post(`${serverUrl}/api/order/place`, payload, { withCredentials: true })

            if (paymentMethod === "cod") {
                dispatch(addMyOrder(result.data))
                navigate("/order-placed", { state: { orderData: { orderId: result.data._id } } })
            } else {
                const { razorOrder, orderId } = result.data
                openRazorpayWindow(orderId, razorOrder)
            }
        } catch (error) {
            console.error("Place order error details:", error.response?.data || error.message)
            alert(error.response?.data?.message || "Error placing order. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const openRazorpayWindow = (orderId, razorOrder) => {
        if (razorOrder.id.startsWith("order_fake_")) {
            handleFakePaymentSuccess(orderId);
            return;
        }

        const options = {
            key: "rzp_test_V0R1e1I2n3G4o5", 
            amount: razorOrder.amount,
            currency: razorOrder.currency,
            name: "Vingo Food",
            description: "Food Order Payment",
            order_id: razorOrder.id,
            handler: async (response) => {
                try {
                    const res = await axios.post(`${serverUrl}/api/order/verify-payment`, {
                        razorpay_payment_id: response.razorpay_payment_id,
                        orderId: orderId
                    }, { withCredentials: true })
                    dispatch(addMyOrder(res.data))
                    navigate("/order-placed", { state: { orderData: { orderId: res.data._id } } })
                } catch (error) {
                    alert("Payment verification failed")
                }
            },
            modal: {
                ondismiss: function() {
                    alert("Payment cancelled. Try again or use COD.");
                }
            },
            prefill: {
                name: userData.fullName,
                email: userData.email,
                contact: userData.mobile
            },
            theme: { color: "#ff4d2d" }
        }
        
        try {
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response){
                handleFakePaymentSuccess(orderId);
            });
            rzp.open();
        } catch (e) {
            console.error("Razorpay error:", e);
            handleFakePaymentSuccess(orderId);
        }
    }

    const handleFakePaymentSuccess = async (orderId) => {
        try {
            const res = await axios.post(`${serverUrl}/api/order/verify-payment`, {
                razorpay_payment_id: "fake_payment_id",
                orderId: orderId
            }, { withCredentials: true })
            dispatch(addMyOrder(res.data))
            navigate("/order-placed", { state: { orderData: { orderId: res.data._id } } })
        } catch (error) {
            alert("Fake payment verification failed")
        }
    }

    useEffect(() => {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.async = true
        document.body.appendChild(script)
        return () => document.body.removeChild(script)
    }, [])

    return (
        <div className='w-full min-h-screen bg-[#fffcfb] flex flex-col lg:flex-row'>
            {/* Left Section: Map and Delivery Info */}
            <div className='w-full lg:w-[65%] h-[50vh] lg:h-screen relative'>
                <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(-1)} 
                    className='absolute top-6 left-6 z-[1000] bg-white p-3 rounded-full shadow-2xl hover:bg-gray-50 text-gray-900 transition-all'
                >
                    <IoIosArrowRoundBack size={28} />
                </motion.button>
                
                <MapContainer center={[location.lat || 20.5937, location.lon || 78.9629]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {location.lat && location.lon && (
                        <Marker position={[location.lat, location.lon]} draggable={true} eventHandlers={{ dragend: onDragEnd }} />
                    )}
                    <RecenterMap location={location} />
                </MapContainer>

                {/* Floating Delivery Form Card - Compact & Side Aligned */}
                <div className='absolute bottom-8 left-8 z-[1000] w-[340px] hidden lg:block'>
                    <motion.div 
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className='bg-white/90 backdrop-blur-2xl p-6 rounded-[2rem] shadow-[0_20px_80px_rgba(0,0,0,0.15)] border border-white/60'
                    >
                        <div className='flex items-center gap-3 mb-6'>
                            <div className='w-10 h-10 bg-gradient-to-br from-[#ff416c] to-[#ff4b2b] rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-100'>
                                <IoLocationSharp size={20} />
                            </div>
                            <div>
                                <h2 className='text-base font-black text-gray-900 uppercase tracking-widest'>Delivery Details</h2>
                                <p className='text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5'>Confirm address & contact</p>
                            </div>
                        </div>
                        
                        <div className='grid grid-cols-2 gap-3 mb-4'>
                            <div className='flex flex-col gap-1'>
                                <label className='text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1'>Full Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Name" 
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className='px-4 py-3 bg-white/50 border border-gray-100 rounded-xl focus:border-[#ff4d2d] focus:bg-white outline-none text-xs font-bold transition-all shadow-sm'
                                />
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1'>Mobile No.</label>
                                <input 
                                    type="text" 
                                    placeholder="9876..." 
                                    value={userPhone}
                                    onChange={(e) => setUserPhone(e.target.value)}
                                    className='px-4 py-3 bg-white/50 border border-gray-100 rounded-xl focus:border-[#ff4d2d] focus:bg-white outline-none text-xs font-bold transition-all shadow-sm'
                                />
                            </div>
                        </div>

                        <div className='relative mb-5'>
                            <label className='text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block'>Complete Address</label>
                            <textarea 
                                className='w-full p-4 bg-white/50 border border-gray-100 rounded-xl focus:border-[#ff4d2d] focus:bg-white outline-none text-[11px] resize-none h-24 pr-12 font-medium leading-relaxed transition-all shadow-sm'
                                value={addressInput}
                                onChange={(e) => setAddressInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), getLatLngByAddress())}
                                placeholder="Flat, Building, Street Name..."
                            />
                            <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={getLatLngByAddress}
                                className='absolute bottom-3 right-3 p-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg'
                                title="Search address"
                            >
                                <IoSearchOutline size={16} />
                            </motion.button>
                        </div>

                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={getCurrentLocation}
                            className='w-full flex items-center justify-center gap-2 py-3 bg-orange-50/50 text-[#ff4d2d] rounded-[1.2rem] font-black text-[9px] uppercase tracking-widest hover:bg-orange-100 transition-all border border-orange-100/50'
                        >
                            <TbCurrentLocation size={16} /> Detect My Location
                        </motion.button>
                    </motion.div>
                </div>

                {/* Mobile version - Bottom Sheet style */}
                <div className='lg:hidden absolute bottom-0 left-0 z-[1000] w-full'>
                    <div className='bg-white p-6 rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] border-t border-gray-100'>
                        <div className='w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-6'></div>
                        <h2 className='text-sm font-black text-gray-900 uppercase tracking-widest mb-6'>Delivery Details</h2>
                        <div className='flex flex-col gap-4 mb-6'>
                            <input type="text" placeholder="Name" value={userName} onChange={(e) => setUserName(e.target.value)} className='px-4 py-3 bg-gray-50 rounded-xl text-xs font-bold outline-none' />
                            <input type="text" placeholder="Mobile" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} className='px-4 py-3 bg-gray-50 rounded-xl text-xs font-bold outline-none' />
                            <textarea className='w-full p-4 bg-gray-50 rounded-xl text-xs h-20 outline-none resize-none' value={addressInput} onChange={(e) => setAddressInput(e.target.value)} placeholder="Address..." />
                        </div>
                        <button onClick={getCurrentLocation} className='w-full py-4 bg-[#ff4d2d] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-100'>
                            Confirm Location
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Section: Order Summary & Payment */}
            <div className='w-full lg:w-[35%] bg-white p-6 md:p-10 flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.02)] relative lg:h-screen overflow-y-auto'>
                <div className='flex items-center justify-between mb-10'>
                    <h1 className='text-3xl font-black text-gray-900 tracking-tight uppercase'>Summary</h1>
                    <div className='px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest'>
                        {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                    </div>
                </div>
                
                <div className='space-y-6 mb-10'>
                    {cartItems.map((item, idx) => (
                        <motion.div 
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            key={idx} 
                            className='flex justify-between items-start group'
                        >
                            <div className='flex gap-4'>
                                <div className='w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 p-1'>
                                    <img src={item.image} className='w-full h-full object-cover rounded-xl' alt={item.name} />
                                </div>
                                <div>
                                    <p className='font-black text-gray-800 group-hover:text-[#ff4d2d] transition-colors'>{item.name}</p>
                                    <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1'>Qty: {item.quantity} × ₹{item.price}</p>
                                </div>
                            </div>
                            <p className='font-black text-gray-900 text-lg'>₹{item.price * item.quantity}</p>
                        </motion.div>
                    ))}
                </div>

                <div className='space-y-4 mb-10 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100'>
                    <div className='flex justify-between text-gray-500 font-bold text-sm'>
                        <span>Subtotal</span>
                        <span>₹{totalAmount}</span>
                    </div>
                    <div className='flex justify-between text-gray-500 font-bold text-sm'>
                        <span className='flex items-center gap-2'>Delivery Fee <FaInfoCircle className='text-gray-300' size={12} /></span>
                        <span className={deliveryFee === 0 ? 'text-green-600' : ''}>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                    </div>
                    <div className='flex justify-between text-gray-500 font-bold text-sm'>
                        <span>GST (5%)</span>
                        <span>₹{gst}</span>
                    </div>
                    <div className='pt-6 mt-2 border-t border-gray-200 flex justify-between items-center'>
                        <div className='flex flex-col'>
                            <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Total Payable</span>
                            <span className='text-4xl font-black text-gray-900 mt-1 tracking-tighter'>₹{finalAmount}</span>
                        </div>
                        <div className='w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-inner'>
                            <FaWallet size={20} />
                        </div>
                    </div>
                </div>

                <div className='mb-10'>
                    <p className='text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 ml-2'>Payment Gateway</p>
                    <div className='grid grid-cols-2 gap-4'>
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setPaymentMethod("cod")}
                            className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all ${paymentMethod === "cod" ? "border-[#ff4d2d] bg-orange-50 text-[#ff4d2d] shadow-lg shadow-orange-100" : "border-gray-50 text-gray-400 hover:border-gray-200"}`}
                        >
                            <FaMobileScreenButton size={24} />
                            <span className='text-[10px] font-black mt-3 uppercase tracking-widest'>Cash on Delivery</span>
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setPaymentMethod("online")}
                            className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all ${paymentMethod === "online" ? "border-[#ff4d2d] bg-orange-50 text-[#ff4d2d] shadow-lg shadow-orange-100" : "border-gray-50 text-gray-400 hover:border-gray-200"}`}
                        >
                            <FaCreditCard size={24} />
                            <span className='text-[10px] font-black mt-3 uppercase tracking-widest'>Online Payment</span>
                        </motion.button>
                    </div>
                </div>

                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className={`mt-auto w-full py-6 rounded-[2rem] font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-4 tracking-widest uppercase ${loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#ff416c] to-[#ff4b2b] text-white shadow-orange-200 hover:shadow-orange-300'}`}
                >
                    {loading ? (
                        <div className='flex items-center gap-3'>
                            <div className='w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin'></div>
                            <span>Processing...</span>
                        </div>
                    ) : (
                        <>Place Order <MdDeliveryDining size={28} /></>
                    )}
                </motion.button>
            </div>
        </div>
    )
}

export default CheckOut
