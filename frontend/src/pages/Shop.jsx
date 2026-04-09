import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { serverUrl } from '../App'
import { useNavigate, useParams } from 'react-router-dom'
import { FaStore } from "react-icons/fa6";
import { FaLocationDot } from "react-icons/fa6";
import { FaUtensils } from "react-icons/fa";
import FoodCard from '../components/FoodCard';
import { FaArrowLeft } from "react-icons/fa";
function Shop() {
    const {shopId}=useParams()
    const [items,setItems]=useState([])
    const [shop,setShop]=useState([])
    const navigate=useNavigate()
    const handleShop=async () => {
        try {
           const result=await axios.get(`${serverUrl}/api/item/get-by-shop/${shopId}`,{withCredentials:true}) 
           setShop(result.data.shop)
           setItems(result.data.items)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=>{
handleShop()
    },[shopId])
  return (
    <div className='min-h-screen bg-transparent'>
        <button className='absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-full shadow-md transition' onClick={()=>navigate("/")}>
        <FaArrowLeft />
<span>Back</span>
        </button>
      {shop && <div className='relative w-full h-64 md:h-80 lg:h-96'>
          <img src={shop.image} alt="" className='w-full h-full object-cover'/>
          <div className='absolute inset-0 bg-gradient-to-b from-black/70 to-black/30 flex flex-col justify-center items-center text-center px-4'>
          <FaStore className='text-white text-4xl mb-3 drop-shadow-md'/>
          <h1 className='text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg'>{shop.name}</h1>
          <div className='flex items-center  gap-[10px]'>
          <FaLocationDot size={22} color='red'/>
             <p className='text-lg font-medium text-gray-200 mt-[10px]'>{shop.address}</p>
             </div>
          </div>
       
        </div>}

<div className='w-full subtle-star-pattern bg-white/95 backdrop-blur-[2px]'>
<div className='max-w-7xl mx-auto px-6 py-16'>
<h2 className='flex items-center justify-center gap-3 text-3xl font-black mb-12 text-gray-900 uppercase tracking-tight'><FaUtensils className='text-[#ff4d2d]'/> Our Menu</h2>

{items.length>0?(
    <div className='flex flex-wrap justify-center gap-8'>
        {items.map((item)=>(
            <FoodCard data={item}/>
        ))}
    </div>
):<div className='flex flex-col items-center gap-4 py-20'>
    <p className='text-center text-gray-400 text-xl font-bold uppercase tracking-tighter'>No Items Available in this shop yet 😔</p>
    <button onClick={()=>navigate("/")} className='text-[#ff4d2d] font-black uppercase text-xs tracking-widest border-b-2 border-[#ff4d2d] pb-1'>Explore other shops</button>
</div>}
</div>
</div>



    </div>
  )
}

export default Shop
