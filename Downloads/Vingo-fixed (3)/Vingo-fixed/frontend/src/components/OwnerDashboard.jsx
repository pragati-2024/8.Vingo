import React from 'react'
import Nav from './Nav'
import { useDispatch, useSelector } from 'react-redux'
import { FaUtensils, FaPlus, FaMapMarkerAlt, FaStore, FaChartLine, FaClipboardList } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { FaPen } from "react-icons/fa";
import OwnerItemCard from './OwnerItemCard';
import { setActiveShop } from '../redux/ownerSlice';
import { motion, AnimatePresence } from 'framer-motion';

function OwnerDashboard() {
  const { myShops, activeShop } = useSelector(state => state.owner)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return (
    <div className='w-full min-h-screen flex flex-col items-center'>
      {/* Dark Hero Section with Restored Background Image */}
      <div className="w-full h-[55vh] md:h-[65vh] relative flex flex-col items-center justify-center text-white overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=2070" 
            className="w-full h-full object-cover" 
            alt="Vendor BG" 
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
            <FaStore className="text-6xl text-[#ff4d2d] drop-shadow-[0_0_15px_rgba(255,77,45,0.8)]" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-4 uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-white"
          >
            Vendor <span className="text-[#ff4d2d]">Hub</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="max-w-2xl text-white font-black text-lg md:text-xl uppercase tracking-[0.3em] drop-shadow-lg"
          >
            Scale your business. Manage menu & track growth.
          </motion.p>
        </div>
      </div>

      {/* Light Content Sections */}
      <div className="w-full -mt-16 z-10 pb-20 flex flex-col items-center subtle-star-pattern pt-10 bg-white/95 backdrop-blur-[2px]">
        <div className='w-full max-w-6xl px-4'>
          {/* Shop Selector */}
          <div className='bg-white rounded-[40px] shadow-2xl p-8 md:p-12 border border-gray-100 mb-12'>
            <div className='flex flex-col md:flex-row justify-between items-center gap-8 mb-10 border-b border-gray-50 pb-10'>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-orange-50 rounded-3xl flex items-center justify-center text-[#ff4d2d] shadow-sm border border-orange-100">
                  <FaStore size={32} />
                </div>
                <div>
                  <h2 className='text-3xl font-black text-gray-900 uppercase tracking-tighter'>My Establishments</h2>
                  <p className='text-gray-400 font-bold text-xs uppercase tracking-widest mt-1'>Select a shop to manage</p>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className='flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#ff4d2d] transition-all shadow-xl'
                onClick={() => navigate('/add-shop')}
              >
                <FaPlus /> Add New Shop
              </motion.button>
            </div>

            <div className='flex flex-wrap gap-6 justify-center md:justify-start'>
              {myShops && myShops.length > 0 ? (
                myShops.map((shop, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    onClick={() => dispatch(setActiveShop(shop))}
                    className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 w-full md:w-[280px] group overflow-hidden ${activeShop?._id === shop._id ? 'border-[#ff4d2d] bg-orange-50/30 shadow-xl' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                  >
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-50 rounded-full opacity-20 group-hover:scale-150 transition-transform" />
                    <div className='flex items-center gap-4 relative z-10'>
                      <img src={shop.image} alt={shop.name} className='w-14 h-14 rounded-2xl object-cover shadow-md' />
                      <div className="flex-1 min-w-0">
                        <h3 className='font-black text-gray-900 uppercase tracking-tighter truncate'>{shop.name}</h3>
                        <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                          <FaMapMarkerAlt className="text-[#ff4d2d]" size={10} />
                          <span className="truncate">{shop.city}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className='w-full py-16 text-center bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200'>
                  <p className='text-gray-400 font-black uppercase tracking-widest text-sm'>No shops found 😔</p>
                  <button onClick={() => navigate('/add-shop')} className="mt-4 text-[#ff4d2d] font-black uppercase text-xs tracking-[0.2em] border-b-2 border-[#ff4d2d] pb-1">Open your first establishment</button>
                </div>
              )}
            </div>
          </div>

          {/* Active Shop Content */}
          <AnimatePresence mode='wait'>
            {activeShop ? (
              <motion.div
                key={activeShop._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className='space-y-12'
              >
                {/* Stats Summary */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center gap-6'>
                    <div className='w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center'><FaUtensils size={24} /></div>
                    <div>
                      <p className='text-3xl font-black text-gray-900'>{activeShop.items?.length || 0}</p>
                      <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Total Items</p>
                    </div>
                  </div>
                  <div className='bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center gap-6'>
                    <div className='w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center'><FaChartLine size={24} /></div>
                    <div>
                      <p className='text-3xl font-black text-gray-900'>4.8</p>
                      <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Shop Rating</p>
                    </div>
                  </div>
                  <div className='bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center gap-6'>
                    <div className='w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center'><FaClipboardList size={24} /></div>
                    <div>
                      <p className='text-3xl font-black text-gray-900'>12</p>
                      <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Today's Orders</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className='bg-white rounded-[40px] shadow-2xl p-8 md:p-12 border border-gray-100'>
                  <div className='flex justify-between items-center mb-10'>
                    <div>
                      <h2 className='text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3'>
                        <FaUtensils className="text-[#ff4d2d]" /> {activeShop.name} Menu
                      </h2>
                      <p className='text-gray-400 font-bold text-xs uppercase tracking-widest mt-1'>Manage your dishes and pricing</p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className='bg-gradient-to-r from-[#ff4d2d] to-[#ff7d2d] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl'
                      onClick={() => navigate('/add-item')}
                    >
                      <FaPlus className='inline mr-2' /> Add Item
                    </motion.button>
                  </div>

                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                    {activeShop.items && activeShop.items.length > 0 ? (
                      activeShop.items.map((item, index) => (
                        <OwnerItemCard key={index} data={item} />
                      ))
                    ) : (
                      <div className='col-span-full py-20 text-center bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200'>
                        <p className='text-gray-400 font-black uppercase tracking-widest text-sm'>No items in menu yet 😔</p>
                        <button onClick={() => navigate('/add-item')} className="mt-4 text-[#ff4d2d] font-black uppercase text-xs tracking-[0.2em] border-b-2 border-[#ff4d2d] pb-1">Create your first dish</button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className='w-full py-20 text-center'>
                <p className='text-gray-300 font-black uppercase tracking-[0.3em] text-sm italic'>Select a shop above to start managing your business</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard
