import React, { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaTicketAlt, FaInfoCircle, FaCheckCircle } from "react-icons/fa";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartItemCard from '../components/CartItemCard';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

function CartPage() {
    const navigate = useNavigate()
    const { cartItems, totalAmount } = useSelector(state => state.user)
    const [coupon, setCoupon] = useState("")
    const [couponApplied, setCouponApplied] = useState(false)
    const [discount, setDiscount] = useState(0)
    
    const deliveryFee = totalAmount > 500 ? 0 : 40
    const gst = Math.round((totalAmount - discount) * 0.05)
    const finalTotal = totalAmount - discount + deliveryFee + gst

    const handleApplyCoupon = () => {
        if (coupon === "SAVE50") {
            setDiscount(50)
            setCouponApplied(true)
            toast.success("Coupon SAVE50 applied! ₹50 saved 🎊", {
                style: { borderRadius: '10px', background: '#333', color: '#fff' }
            })
        } else {
            toast.error("Invalid Coupon Code", {
                style: { borderRadius: '10px', background: '#333', color: '#fff' }
            })
        }
    }

    return (
        <div className='min-h-screen bg-[#fff9f6] flex justify-center p-4 md:p-8'>
            <div className='w-full max-w-[900px]'>
                <div className='flex items-center gap-4 mb-8'>
                    <motion.button 
                        whileHover={{ x: -5 }}
                        onClick={() => navigate("/")} 
                        className='bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all'
                    >
                        <IoIosArrowRoundBack size={30} className='text-[#ff4d2d]' />
                    </motion.button>
                    <h1 className='text-3xl font-black text-gray-900'>Your Cart</h1>
                </div>

                {cartItems?.length == 0 ? (
                    <div className='flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-orange-200'>
                        <p className='text-gray-400 text-lg font-medium italic'>Your cart is hungry... add some food! 🍕</p>
                        <button onClick={() => navigate("/")} className='mt-6 text-[#ff4d2d] font-bold hover:underline'>Browse Restaurants</button>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
                        {/* Left: Items */}
                        <div className='lg:col-span-7 space-y-4'>
                            {cartItems?.map((item, index) => (
                                <CartItemCard data={item} key={index} />
                            ))}
                        </div>

                        {/* Right: Summary */}
                        <div className='lg:col-span-5 space-y-6'>
                            {/* Coupon Section */}
                            <div className='bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden'>
                                {couponApplied && <div className='absolute top-0 right-0 p-2'><FaCheckCircle className='text-green-500' size={20} /></div>}
                                <div className='flex items-center gap-2 mb-4 text-[#ff4d2d] font-black uppercase text-xs tracking-widest'>
                                    <FaTicketAlt />
                                    <span>Offers & Coupons</span>
                                </div>
                                <div className='flex gap-2'>
                                    <input 
                                        type="text" 
                                        placeholder="Enter SAVE50" 
                                        value={coupon}
                                        onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                                        disabled={couponApplied}
                                        className={`flex-1 bg-gray-50 border-2 rounded-xl px-4 py-2 text-sm outline-none transition-all uppercase font-bold ${couponApplied ? 'border-green-100 text-green-600' : 'border-gray-100 focus:border-[#ff4d2d]'}`}
                                    />
                                    <button 
                                        onClick={handleApplyCoupon}
                                        disabled={couponApplied}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${couponApplied ? 'bg-green-500 text-white' : 'bg-gray-800 text-white hover:bg-black'}`}
                                    >
                                        {couponApplied ? "Applied" : "Apply"}
                                    </button>
                                </div>
                                {couponApplied && <p className='text-[10px] text-green-600 font-bold mt-2 uppercase tracking-widest'>You saved ₹{discount} with SAVE50!</p>}
                            </div>

                            {/* Price Breakdown */}
                            <div className='bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100'>
                                <h3 className='text-gray-900 font-black uppercase text-xs tracking-widest mb-6'>Bill Details</h3>
                                <div className='space-y-4'>
                                    <div className='flex justify-between text-sm text-gray-500 font-medium'>
                                        <span>Item Total</span>
                                        <span>₹{totalAmount}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className='flex justify-between text-sm text-green-600 font-bold'>
                                            <span>Coupon Discount (SAVE50)</span>
                                            <span>- ₹{discount}</span>
                                        </div>
                                    )}
                                    <div className='flex justify-between text-sm text-gray-500 font-medium'>
                                        <span className='flex items-center gap-1'>Delivery Fee <FaInfoCircle size={10} className='text-gray-300'/></span>
                                        <span className={deliveryFee === 0 ? "text-green-600 font-bold" : ""}>
                                            {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                                        </span>
                                    </div>
                                    <div className='flex justify-between text-sm text-gray-500 font-medium'>
                                        <span>GST (5%)</span>
                                        <span>₹{gst}</span>
                                    </div>
                                    
                                    <div className='pt-4 border-t-2 border-gray-50 flex justify-between items-center'>
                                        <div className='flex flex-col'>
                                            <span className='text-gray-900 font-black uppercase text-sm'>To Pay</span>
                                            <span className='text-[10px] text-gray-400 font-bold uppercase tracking-widest'>Inc. all taxes</span>
                                        </div>
                                        <span className='text-3xl font-black text-[#ff4d2d] drop-shadow-sm'>₹{finalTotal}</span>
                                    </div>
                                </div>
                            </div>

                            <motion.button 
                                whileTap={{ scale: 0.98 }}
                                className='w-full bg-gradient-to-r from-[#ff416c] to-[#ff4b2b] text-white py-5 rounded-3xl text-lg font-black uppercase tracking-widest shadow-xl hover:shadow-orange-200 transition-all cursor-pointer' 
                                onClick={()=>navigate("/checkout")}
                            >
                                Checkout
                            </motion.button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CartPage
