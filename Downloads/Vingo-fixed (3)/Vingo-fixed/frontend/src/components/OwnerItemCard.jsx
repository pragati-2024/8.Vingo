import axios from 'axios';
import React from 'react'
import { FaPen, FaTrashAlt, FaLeaf, FaDrumstickBite, FaTag } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveShop, setMyShops } from '../redux/ownerSlice';
import { motion } from 'framer-motion';

function OwnerItemCard({data}) {
    const navigate=useNavigate()
    const dispatch=useDispatch()
    const { activeShop, myShops } = useSelector(state => state.owner)
    
    const handleDelete=async () => {
      if(!window.confirm("Are you sure you want to delete this item?")) return;
      try {
        const result=await axios.get(`${serverUrl}/api/item/delete/${data._id}`,{withCredentials:true})
        
        const updatedShops = myShops.map(shop => 
            shop._id === activeShop._id ? result.data : shop
        )
        
        dispatch(setMyShops(updatedShops))
        dispatch(setActiveShop(result.data))
      } catch (error) {
        console.log(error)
      }
    }

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className='flex bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden border border-gray-100 w-full max-w-2xl group hover:shadow-xl transition-all duration-300'
    >
      <div className='w-40 flex-shrink-0 bg-gray-50 relative overflow-hidden'>
        <img src={data.image} alt={data.name} className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'/>
        <div className='absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm'>
          {data.foodType === "veg" ? <FaLeaf className='text-green-600 text-xs' /> : <FaDrumstickBite className='text-red-600 text-xs' />}
        </div>
      </div>
      
      <div className='flex flex-col justify-between p-6 flex-1'>
          <div className="space-y-1">
            <div className="flex justify-between items-start">
              <h2 className='text-xl font-black text-gray-900 uppercase tracking-tighter group-hover:text-[#ff4d2d] transition-colors'>{data.name}</h2>
              <span className='text-xl font-black text-[#ff4d2d]'>₹{data.price}</span>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <FaTag size={10} className="text-gray-300" />
              <span>{data.category}</span>
            </div>
            
            <p className="text-gray-500 text-xs font-medium mt-2 line-clamp-1">{data.description || "Freshly prepared and delicious."}</p>
          </div>

          <div className='flex items-center justify-end gap-3 mt-4'>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className='p-3 cursor-pointer rounded-2xl bg-orange-50 text-[#ff4d2d] hover:bg-[#ff4d2d] hover:text-white transition-all shadow-sm' 
              onClick={()=>navigate(`/edit-item/${data._id}`)}
              title="Edit Item"
            >
              <FaPen size={14}/>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className='p-3 cursor-pointer rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm' 
              onClick={handleDelete}
              title="Delete Item"
            >
              <FaTrashAlt size={14}/>
            </motion.button>
          </div>
      </div>
    </motion.div>
  )
}

export default OwnerItemCard
