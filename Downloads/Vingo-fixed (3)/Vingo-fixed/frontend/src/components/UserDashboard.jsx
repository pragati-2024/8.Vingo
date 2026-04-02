import React, { useEffect, useRef, useState } from 'react'
import Nav from './Nav'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import { FaCircleChevronLeft, FaCircleChevronRight, FaStar } from "react-icons/fa6";
import { useSelector } from 'react-redux';
import FoodCard from './FoodCard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import TrustSection from './TrustSection';
import { motion } from 'framer-motion';

import useGetShopByCity from '../hooks/useGetShopByCity';
import useGetItemsByCity from '../hooks/useGetItemsByCity';
import { ClipLoader } from 'react-spinners';

function UserDashboard() {
  const { currentCity, shopInMyCity, itemsInMyCity, searchItems, userData } = useSelector(state => state.user)
  const { loading: shopsLoading, error: shopsError } = useGetShopByCity()
  const { loading: itemsLoading, error: itemsError } = useGetItemsByCity()
  
  const cateScrollRef = useRef(null)
  const shopScrollRef = useRef(null)
  const navigate=useNavigate()
  const [showLeftCateButton,setShowLeftCateButton]=useState(false)
  const [showRightCateButton,setShowRightCateButton]=useState(false)
   const [showLeftShopButton,setShowLeftShopButton]=useState(false)
  const [showRightShopButton,setShowRightShopButton]=useState(false)
  const [updatedItemsList,setUpdatedItemsList]=useState([])
  const [trendingItems, setTrendingItems] = useState([])
  const [recommendedItems, setRecommendedItems] = useState([])

  // Redirect if not logged in or wrong role (Safety Check)
  useEffect(() => {
    if (userData === null) {
      navigate('/signin')
    } else if (userData && userData.role !== 'user') {
      navigate('/')
    }
  }, [userData, navigate])

  if (userData === undefined) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-transparent">
        <ClipLoader size={50} color='#ff4d2d' />
        <p className="mt-4 text-white font-black uppercase tracking-widest text-xs">Loading Vingo...</p>
      </div>
    )
  }

const handleFilterByCategory=(category)=>{
if(category=="All"){
  setUpdatedItemsList(itemsInMyCity)
}else{
  const filteredList=itemsInMyCity?.filter(i=>i.category===category)
  setUpdatedItemsList(filteredList)
}

}

useEffect(()=>{
setUpdatedItemsList(itemsInMyCity)
if (itemsInMyCity?.length > 0) {
    // Simulate trending and recommended
    setTrendingItems([...itemsInMyCity].sort(() => 0.5 - Math.random()).slice(0, 4))
    setRecommendedItems([...itemsInMyCity].sort(() => 0.5 - Math.random()).slice(0, 4))
}
},[itemsInMyCity])


  const updateButton=(ref,setLeftButton,setRightButton)=>{
const element=ref.current
if(element){
setLeftButton(element.scrollLeft>0)
setRightButton(element.scrollLeft+element.clientWidth<element.scrollWidth)

}
  }
  const scrollHandler=(ref,direction)=>{
    if(ref.current){
      ref.current.scrollBy({
        left:direction=="left"?-200:200,
        behavior:"smooth"
      })
    }
  }




  useEffect(() => {
    const cateElement = cateScrollRef.current
    const shopElement = shopScrollRef.current

    const handleCateScroll = () => updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
    const handleShopScroll = () => updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)

    if (cateElement) {
      updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
      cateElement.addEventListener('scroll', handleCateScroll)
    }
    if (shopElement) {
      updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
      shopElement.addEventListener('scroll', handleShopScroll)
    }

    return () => {
      cateElement?.removeEventListener("scroll", handleCateScroll)
      shopElement?.removeEventListener("scroll", handleShopScroll)
    }
  }, [categories, shopInMyCity])


  return (
    <div className='w-full min-h-screen flex flex-col items-center'>
      <div className="w-full h-[60vh] md:h-[75vh] relative flex flex-col items-center justify-center text-white overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2070" 
            className="w-full h-full object-cover" 
            alt="Hero BG" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#f8f9fb]"></div>
        </div>

        {/* Floating Decorative Images */}
        <motion.img 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 0.8, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          src="/src/assets/scooter.png" 
          className="absolute left-[10%] top-[20%] w-24 md:w-40 hidden lg:block drop-shadow-2xl animate-pulse"
          alt="decoration"
        />
        <motion.img 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 0.8, x: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          src="/src/assets/home.png" 
          className="absolute right-[10%] bottom-[20%] w-24 md:w-40 hidden lg:block drop-shadow-2xl"
          alt="decoration"
        />

        <div className="z-10 flex flex-col items-center text-center px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20">
               <img src="/src/assets/scooter.png" alt="Scooter" className="w-12 md:w-20 drop-shadow-2xl" />
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-black tracking-tighter mb-6 drop-shadow-2xl text-white uppercase"
          >
            Vingo <span className="text-[#ff4d2d]">Food</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="max-w-2xl text-white font-bold text-xl md:text-2xl drop-shadow-lg mb-8"
          >
            Best food in <span className="text-[#ff4d2d] border-b-4 border-[#ff4d2d]">{currentCity}</span> delivered to your doorstep.
          </motion.p>

          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.4 }}
             className="flex gap-4"
          >
             <button onClick={() => scrollHandler(shopScrollRef, 'right')} className="bg-[#ff4d2d] text-white px-8 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl">
               Order Now
             </button>
             <button className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-white/30 transition-all">
               Explore
             </button>
          </motion.div>
        </div>
      </div>

      {/* Light Content Sections */}
      <div className="w-full -mt-20 z-10 pb-20">
        {searchItems && searchItems.length > 0 && (
          <div className='w-full max-w-6xl mx-auto flex flex-col gap-5 items-start p-5 subtle-star-pattern shadow-lg rounded-2xl mb-10'>
            <h1 className='text-gray-900 text-2xl sm:text-3xl font-semibold border-b border-gray-200 pb-2'>
              Search Results
            </h1>
            <div className='w-full h-auto flex flex-wrap gap-6 justify-center'>
              {searchItems.map((item) => (
                <FoodCard data={item} key={item._id} />
              ))}
            </div>
          </div>
        )}

        {/* Category Section */}
        <section className='w-full subtle-star-pattern py-14 flex flex-col items-center border-b border-gray-100 bg-white/95 backdrop-blur-[2px]'>
          <div className='w-full max-w-[1200px] px-6 lg:px-20 flex flex-col gap-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl md:text-3xl font-black text-gray-900 tracking-tight uppercase'>Inspiration for your first order</h2>
                <p className='text-gray-400 font-medium text-xs mt-1 capitalize'>Explore our top categories</p>
              </div>
              <div className='flex gap-3'>
                {showLeftCateButton && (
                  <button onClick={() => scrollHandler(cateScrollRef, 'left')} className='w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100 hover:bg-[#ff4d2d] hover:text-white transition-all'>
                    <FaCircleChevronLeft size={18} />
                  </button>
                )}
                <button onClick={() => scrollHandler(cateScrollRef, 'right')} className='w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100 hover:bg-[#ff4d2d] hover:text-white transition-all'>
                  <FaCircleChevronRight size={18} />
                </button>
              </div>
            </div>
            
            <div ref={cateScrollRef} className='w-full flex gap-5 overflow-x-scroll no-scrollbar py-2'>
              {categories.map((cate, index) => (
                <CategoryCard key={index} name={cate.category} image={cate.image} onClick={() => handleFilterByCategory(cate.category)} />
              ))}
            </div>
          </div>
        </section>

        {/* Best Shops Section */}
        <section className='w-full py-14 flex flex-col items-center subtle-star-pattern bg-[#f8f9fb]/95 backdrop-blur-[2px]'>
          <div className='w-full max-w-[1200px] px-6 lg:px-20 flex flex-col gap-8'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl md:text-3xl font-black text-gray-900 tracking-tight uppercase'>Best Shops in {currentCity}</h2>
                <p className='text-gray-400 font-medium text-xs mt-1 capitalize'>Handpicked for you</p>
              </div>
              <div className='flex gap-3'>
                {showLeftShopButton && (
                  <button onClick={() => scrollHandler(shopScrollRef, 'left')} className='w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100 hover:bg-[#ff4d2d] hover:text-white transition-all'>
                    <FaCircleChevronLeft size={18} />
                  </button>
                )}
                <button onClick={() => scrollHandler(shopScrollRef, 'right')} className='w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100 hover:bg-[#ff4d2d] hover:text-white transition-all'>
                  <FaCircleChevronRight size={18} />
                </button>
              </div>
            </div>

            <div ref={shopScrollRef} className='w-full flex gap-6 overflow-x-scroll no-scrollbar py-4 min-h-[200px] items-center justify-start'>
              {shopsLoading ? (
                <div className='w-full flex flex-col items-center gap-2'>
                  <ClipLoader size={30} color='#ff4d2d' />
                  <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Searching Restaurants...</p>
                </div>
              ) : shopInMyCity && shopInMyCity.length > 0 ? (
                shopInMyCity.map((shop, index) => (
                  <motion.div
                    whileHover={{ y: -6, scale: 1.01 }}
                    key={index}
                    onClick={() => navigate(`/shop/${shop._id}`)}
                    className='w-[320px] md:w-[350px] shrink-0 bg-white rounded-2xl overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.06)] border border-gray-100 cursor-pointer group transition-all duration-300'
                  >
                    <div className='w-full h-52 overflow-hidden relative'>
                      <img src={shop.image} className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105' alt={shop.name} />
                      <div className='absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-800 shadow-sm'>
                        ⏱ 25-30 mins
                      </div>
                    </div>
                    <div className='p-5'>
                      <div className='flex justify-between items-center mb-1.5'>
                        <h3 className='text-lg font-black text-gray-900 truncate group-hover:text-[#ff4d2d] transition-colors uppercase'>{shop.name}</h3>
                        <div className='flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded'>
                          <span className='text-[10px] font-black text-green-700'>4.2</span>
                          <FaStar className='text-green-700' size={8} />
                        </div>
                      </div>
                      <p className='text-[10px] text-gray-400 font-semibold uppercase tracking-wider truncate'>{shop.address}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className='flex flex-col items-center gap-3 py-10'>
                  <p className='text-lg font-black text-gray-400 uppercase tracking-tighter'>No restaurants found in {currentCity || "this city"} 😔</p>
                  <p className='text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]'>Try searching for "Mathura" or "Delhi"</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Trending Section */}
        <section className='w-full subtle-star-pattern py-14 flex flex-col items-center border-y border-gray-50 bg-white/95 backdrop-blur-[2px]'>
          <div className='w-full max-w-[1200px] px-6 lg:px-20 flex flex-col gap-8'>
            <div>
              <h2 className='text-2xl md:text-3xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-2'>
                <span className='text-[#ff4d2d]'>🔥</span> Trending Now
              </h2>
              <p className='text-gray-400 font-medium text-xs mt-1 capitalize'>Most loved items right now</p>
            </div>
            <div className='w-full flex flex-wrap gap-x-6 gap-y-10 justify-center md:justify-start min-h-[300px] items-center'>
              {itemsLoading ? (
                <div className='w-full flex flex-col items-center gap-2'>
                  <ClipLoader size={30} color='#ff4d2d' />
                  <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Curating trending items...</p>
                </div>
              ) : trendingItems && trendingItems.length > 0 ? (
                trendingItems.map((item, index) => (
                  <FoodCard key={index} data={item} />
                ))
              ) : (
                <div className='w-full flex flex-col items-center gap-3 py-10'>
                  <p className='text-lg font-black text-gray-400 uppercase tracking-tighter'>No trending items in {currentCity} yet</p>
                  <p className='text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]'>We'll be here soon!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* How It Works Section - Added more images as requested */}
        <section className='w-full py-20 bg-white/95 backdrop-blur-[2px] border-b border-gray-50 subtle-star-pattern'>
          <div className='w-full max-w-[1200px] mx-auto px-6 lg:px-20'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase mb-2'>How Vingo Works</h2>
              <p className='text-[#ff4d2d] font-black uppercase tracking-[0.3em] text-[10px]'>Simple. Fast. Delicious.</p>
            </div>
            
            <div className='grid grid-cols-1 md:grid-cols-3 gap-12'>
              <motion.div 
                whileHover={{ y: -10 }}
                className='flex flex-col items-center text-center p-8 bg-[#f8f9fb] rounded-3xl border border-gray-100 shadow-sm group hover:shadow-2xl transition-all duration-500'
              >
                <div className='w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform'>
                  <img src="/src/assets/shop.png" alt="Shop" className="w-14" />
                </div>
                <h3 className='text-xl font-black text-gray-900 uppercase mb-2'>1. Select Restaurant</h3>
                <p className='text-gray-500 text-sm font-medium'>Browse through hundreds of local restaurants in your city.</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -10 }}
                className='flex flex-col items-center text-center p-8 bg-[#f8f9fb] rounded-3xl border border-gray-100 shadow-sm group hover:shadow-2xl transition-all duration-500'
              >
                <div className='w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform'>
                  <img src="/src/assets/home.png" alt="Order" className="w-14" />
                </div>
                <h3 className='text-xl font-black text-gray-900 uppercase mb-2'>2. Place Order</h3>
                <p className='text-gray-500 text-sm font-medium'>Add your favorite items to cart and pay securely in seconds.</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -10 }}
                className='flex flex-col items-center text-center p-8 bg-[#f8f9fb] rounded-3xl border border-gray-100 shadow-sm group hover:shadow-2xl transition-all duration-500'
              >
                <div className='w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform'>
                  <img src="/src/assets/scooter.png" alt="Delivery" className="w-14" />
                </div>
                <h3 className='text-xl font-black text-gray-900 uppercase mb-2'>3. Fast Delivery</h3>
                <p className='text-gray-500 text-sm font-medium'>Track your order in real-time and get it delivered in 30 mins.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Recommended Section */}
        <section className='w-full py-14 flex flex-col items-center subtle-star-pattern bg-[#fdf8f6]/95 backdrop-blur-[2px]'>
          <div className='w-full max-w-[1200px] px-6 lg:px-20 flex flex-col gap-8'>
            <div>
              <h2 className='text-2xl md:text-3xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-2'>
                <span className='text-blue-500'>✨</span> Recommended for You
              </h2>
              <p className='text-gray-400 font-medium text-xs mt-1 capitalize'>Based on your taste</p>
            </div>
            <div className='w-full flex flex-wrap gap-x-6 gap-y-10 justify-center md:justify-start'>
              {recommendedItems?.map((item, index) => (
                <FoodCard key={index} data={item} />
              ))}
            </div>
          </div>
        </section>

        {/* General List */}
        <section className='w-full subtle-star-pattern py-10 flex flex-col items-center border-t border-gray-50 bg-white/95 backdrop-blur-[2px]'>
          <div className='w-full max-w-[1200px] px-6 lg:px-20 flex flex-col gap-8'>
            <div>
              <h2 className='text-2xl md:text-3xl font-black text-gray-900 tracking-tight uppercase'>Suggested for You</h2>
              <p className='text-gray-400 font-medium text-xs mt-1 capitalize'>Discover more delicious options</p>
            </div>
            <div className='w-full flex flex-wrap gap-x-6 gap-y-10 justify-center md:justify-start'>
              {updatedItemsList?.map((item, index) => (
                <FoodCard key={index} data={item} />
              ))}
            </div>
          </div>
        </section>

        <TrustSection />
      </div>
    </div>
  )
}

export default UserDashboard
