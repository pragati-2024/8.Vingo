// import React from 'react'
// import { FaCircleCheck } from "react-icons/fa6";
// import { useNavigate } from 'react-router-dom';
// function OrderPlaced() {
//     const navigate=useNavigate()
//   return (
//     <div className='min-h-screen bg-[#fff9f6] flex flex-col justify-center items-center px-4 text-center relative overflow-hidden'>
//       <FaCircleCheck className='text-green-500 text-6xl mb-4'/>
//       <h1 className='text-3xl font-bold text-gray-800 mb-2'>Order Placed!
//       </h1>
//       <p className='text-gray-600 max-w-md mb-6'>Thank you for your purchase. Your order is being prepared.  
//         You can track your order status in the "My Orders" section.
//      </p>
//      <button className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-6 py-3 rounded-lg text-lg font-medium transition' onClick={()=>navigate("/my-orders")}>Back to my orders</button>
//     </div>
//   )
// }

// export default OrderPlaced

import React from 'react'
import { FaCheckCircle, FaHome, FaShoppingBag } from "react-icons/fa";
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

function OrderPlaced() {
    const navigate = useNavigate()
    const location = useLocation()
    const orderData = location.state?.orderData

    return (
        <div className='min-h-screen bg-[#fff9f6] flex flex-col justify-center items-center px-4 text-center relative overflow-hidden'>
            {/* Background Decorative Elements */}
            <div className='absolute top-[-10%] left-[-10%] w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-50'></div>
            <div className='absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-red-100 rounded-full blur-3xl opacity-50'></div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className='bg-white p-10 md:p-16 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-white max-w-lg w-full z-10'
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className='w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-500 mx-auto mb-8 shadow-inner'
                >
                    <FaCheckCircle size={48} />
                </motion.div>

                <h1 className='text-4xl font-black text-gray-900 mb-4 tracking-tight'>
                    Order Placed! 🎉
                </h1>

                <p className='text-gray-500 font-medium mb-8 leading-relaxed'>
                    {orderData?.orderId ? (
                        <>Your order <span className='text-gray-900 font-bold'>#{orderData.orderId.slice(-6).toUpperCase()}</span> is successfully placed and being prepared.</>
                    ) : (
                        "Your delicious food is on the way! Thank you for choosing Vingo."
                    )}
                </p>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className='flex items-center justify-center gap-2 bg-[#ff4d2d] text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-200 transition-all'
                        onClick={() => navigate("/my-orders")}
                    >
                        <FaShoppingBag size={14} />
                        My Orders
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className='flex items-center justify-center gap-2 bg-gray-100 text-gray-600 px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all'
                        onClick={() => navigate("/")}
                    >
                        <FaHome size={14} />
                        Go Home
                    </motion.button>
                </div>
            </motion.div>

            {/* Confetti-like elements */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 1, repeat: Infinity, repeatType: "reverse" }}
                    className={`absolute hidden md:block w-3 h-3 rounded-full ${i % 2 === 0 ? 'bg-orange-300' : 'bg-red-300'}`}
                    style={{
                        top: `${Math.random() * 80 + 10}%`,
                        left: `${Math.random() * 80 + 10}%`
                    }}
                />
            ))}
        </div>
    )
}

export default OrderPlaced