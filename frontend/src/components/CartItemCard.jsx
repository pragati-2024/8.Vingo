import React from 'react'
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { CiTrash } from "react-icons/ci";
import { useDispatch } from 'react-redux';
import { removeCartItem, updateQuantity } from '../redux/userSlice';
function CartItemCard({data}) {
    const dispatch=useDispatch()
    const handleIncrease=(id,currentQty)=>{
       dispatch(updateQuantity({id,quantity:currentQty+1}))
    }
      const handleDecrease=(id,currentQty)=>{
        if(currentQty>1){
  dispatch(updateQuantity({id,quantity:currentQty-1}))
        }




import React, { useState } from 'react'
import { FaLeaf, FaDrumstickBite, FaStar, FaRegStar, FaMinus, FaPlus, FaShoppingCart, FaFire, FaHeart, FaRegHeart } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/userSlice';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

function FoodCard({ data }) {
  const [quantity, setQuantity] = useState(1)
  const dispatch = useDispatch()
  const { cartItems } = useSelector(state => state.user)
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Realistic Dummy Data
  const [realisticRating] = useState((Math.random() * (4.8 - 3.8) + 3.8).toFixed(1));
  const [reviewsCount] = useState(Math.floor(Math.random() * 2000) + 500);
  const [isBestseller] = useState(Math.random() > 0.7);
  const [isTrending] = useState(Math.random() > 0.8);
  const [discount] = useState(Math.random() > 0.6 ? Math.floor(Math.random() * 20) + 10 : null);
  const [isOpen] = useState(Math.random() > 0.2); // 80% chance of being open
  const [deliveryTime] = useState("30–40 mins");

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: data._id,
      name: data.name,
      price: data.price,
      image: data.image,
      shop: data.shop,
      quantity: quantity,
      foodType: data.foodType
    }))
    toast.success(`${data.name} added to cart! ✅`, {
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    })
  }

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className='w-[230px] rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100 hover:shadow-[0_20px_50px_rgba(255,77,45,0.12)] transition-all duration-500 flex flex-col group'
    >
      <div className='relative w-full h-[140px] overflow-hidden'>
        {/* Badges */}
        <div className='absolute top-2 left-2 z-10 flex flex-col gap-1'>
          {isBestseller && (
            <span className='bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase tracking-wider'>
              Bestseller
            </span>
          )}
          {isTrending && (
            <span className='bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase tracking-wider'>
              Trending
            </span>
          )}
          {discount && (
            <span className='bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase tracking-wider'>
              {discount}% OFF
            </span>
          )}
        </div>
        
    }
  return (
    <div className='flex items-center justify-between bg-white p-4 rounded-xl shadow border'>
      <div className='flex items-center gap-4'>
        <img src={data.image} alt="" className='w-20 h-20 object-cover rounded-lg border'/>
        <div>
            <h1 className='font-medium text-gray-800'>{data.name}</h1>
            <p className='text-sm text-gray-500'>₹{data.price} x {data.quantity}</p>
            <p className="font-bold text-gray-900">₹{data.price*data.quantity}</p>
        </div>
      </div>
      <div className='flex items-center gap-3'>
        <button className='p-2 cursor-pointer bg-gray-100 rounded-full hover:bg-gray-200' onClick={()=>handleDecrease(data.id,data.quantity)}>
        <FaMinus size={12}/>
        </button>
        <span>{data.quantity}</span>
        <button className='p-2 cursor-pointer bg-gray-100 rounded-full hover:bg-gray-200'  onClick={()=>handleIncrease(data.id,data.quantity)}>
        <FaPlus size={12}/>
        </button>
        <button className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
 onClick={()=>dispatch(removeCartItem(data.id))}>
<CiTrash size={18}/>
        </button>
      </div>
    </div>
  )
}

export default CartItemCard
export default FoodCard
