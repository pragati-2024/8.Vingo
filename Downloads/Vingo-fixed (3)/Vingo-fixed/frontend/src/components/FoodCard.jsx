// import React, { useState } from 'react'
// import { FaLeaf } from "react-icons/fa";
// import { FaDrumstickBite } from "react-icons/fa";
// import { FaStar } from "react-icons/fa";
// import { FaRegStar } from "react-icons/fa6";
// import { FaMinus } from "react-icons/fa";
// import { FaPlus } from "react-icons/fa";
// import { FaShoppingCart } from "react-icons/fa";
// import { useDispatch, useSelector } from 'react-redux';
// import { addToCart } from '../redux/userSlice';

// function FoodCard({data}) {
// const [quantity,setQuantity]=useState(0)
// const dispatch=useDispatch()
// const {cartItems}=useSelector(state=>state.user)
//     const renderStars=(rating)=>{   //r=3
//         const stars=[];
//         for (let i = 1; i <= 5; i++) {
//            stars.push(
//             (i<=rating)?(
//                 <FaStar className='text-yellow-500 text-lg'/>
//             ):(
//                 <FaRegStar className='text-yellow-500 text-lg'/>
//             )
//            )
            
//         }
// return stars
//     }

// const handleIncrease=()=>{
//     const newQty=quantity+1
//     setQuantity(newQty)
// }
// const handleDecrease=()=>{
//     if(quantity>0){
// const newQty=quantity-1
//     setQuantity(newQty)
//     }
    
// }

//   return (
//     <div className='w-[250px] rounded-2xl border-2 border-[#ff4d2d] bg-white shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col'>
//       <div className='relative w-full h-[170px] flex justify-center items-center bg-white'>
//         <div className='absolute top-3 right-3 bg-white rounded-full p-1 shadow'>{data.foodType=="veg"?<FaLeaf className='text-green-600 text-lg'/>:<FaDrumstickBite className='text-red-600 text-lg'/>}</div>


// <img src={data.image} alt="" className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'/>
//       </div>

//       <div className="flex-1 flex flex-col p-4">
// <h1 className='font-semibold text-gray-900 text-base truncate'>{data.name}</h1>

// <div className='flex items-center gap-1 mt-1'>
// {renderStars(data.rating?.average || 0)}
// <span className='text-xs text-gray-500'>
//     {data.rating?.count || 0}
// </span>
// </div>
//       </div>

// <div className='flex items-center justify-between mt-auto p-3'>
// <span className='font-bold text-gray-900 text-lg'>
//     ₹{data.price}
// </span>

// <div className='flex items-center border rounded-full overflow-hidden shadow-sm'>
// <button className='px-2 py-1 hover:bg-gray-100 transition' onClick={handleDecrease}>
// <FaMinus size={12}/>
// </button>
// <span>{quantity}</span>
// <button className='px-2 py-1 hover:bg-gray-100 transition' onClick={handleIncrease}>
// <FaPlus size={12}/>
// </button>
// <button className={`${cartItems.some(i=>i.id==data._id)?"bg-gray-800":"bg-[#ff4d2d]"} text-white px-3 py-2 transition-colors`}  onClick={()=>{
//     quantity>0?dispatch(addToCart({
//           id:data._id,
//           name:data.name,
//           price:data.price,
//           image:data.image,
//           shop:data.shop,
//           quantity,
//           foodType:data.foodType
// })):null}}>
// <FaShoppingCart size={16}/>
// </button>
// </div>
// </div>


//     </div>
//   )
// }

// export default FoodCard



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
        
        <div className='absolute top-2 right-2 z-20 flex flex-col gap-1.5'>
          <div className='bg-white/90 backdrop-blur-md rounded-full p-1 shadow-sm border border-gray-100'>
            {data.foodType == "veg"
              ? <FaLeaf className='text-green-600 text-[10px]' />
              : <FaDrumstickBite className='text-red-600 text-[10px]' />}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsWishlisted(!isWishlisted); }}
            className={`p-1.5 rounded-full backdrop-blur-md shadow-sm border transition-all ${isWishlisted ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white/90 border-gray-100 text-gray-400'}`}
          >
            {isWishlisted ? <FaHeart size={10} /> : <FaRegHeart size={10} />}
          </button>
        </div>

        <img 
          src={data.image} 
          alt={data.name} 
          className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110' 
        />
        
        <div className='absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none'></div>
      </div>

      <div className="flex-1 flex flex-col p-4">
        <div className='flex justify-between items-start mb-1 gap-1'>
          <h1 className='font-black text-gray-800 text-sm leading-tight group-hover:text-[#ff4d2d] transition-colors truncate w-[70%]'>{data.name}</h1>
          <span className='font-black text-gray-900 text-sm'>₹{data.price}</span>
        </div>

        <p className='text-gray-400 text-[10px] line-clamp-1 mb-2'>
          {data.description || "Freshly prepared with love."}
        </p>

        <div className='flex items-center gap-1.5 mb-2'>
          <div className='flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded'>
            <FaStar className='text-green-600 text-[8px]' />
            <span className='text-green-700 text-[10px] font-bold'>{realisticRating}</span>
          </div>
          <span className='text-[8px] text-gray-400 font-bold uppercase tracking-tighter truncate'>({reviewsCount})</span>
          <div className='flex items-center gap-1 ml-auto'>
             <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
             <span className={`text-[8px] font-bold uppercase tracking-tight ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                {isOpen ? 'Open' : 'Closed'}
             </span>
          </div>
        </div>

        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-1 text-[#ff4d2d]'>
            <FaFire size={10} className='animate-pulse' />
            <p className='text-[8px] font-bold uppercase tracking-wide'>1k+ ordered</p>
          </div>
          <div className='text-[8px] font-bold text-gray-500 flex items-center gap-0.5'>
            <span>⏱</span> {deliveryTime}
          </div>
        </div>

        <div className='flex items-center justify-between mt-auto gap-2'>
          <div className='flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-100'>
            <button 
              className='w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-all text-gray-400 hover:text-[#ff4d2d]' 
              onClick={() => quantity > 1 && setQuantity(quantity - 1)}
            >
              <FaMinus size={8}/>
            </button>
            <span className='w-4 text-center font-bold text-xs text-gray-700'>{quantity}</span>
            <button 
              className='w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-all text-gray-400 hover:text-[#ff4d2d]' 
              onClick={() => setQuantity(quantity + 1)}
            >
              <FaPlus size={8}/>
            </button>
          </div>

          <button
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-sm ${
              cartItems.some(i => i.id == data._id) 
              ? "bg-gray-800 text-white shadow-gray-200" 
              : "bg-gradient-to-r from-[#ff416c] to-[#ff4b2b] text-white hover:shadow-orange-200 hover:scale-[1.02]"
            }`}
            onClick={handleAddToCart}
          >
            <FaShoppingCart size={10} />
            {cartItems.some(i => i.id == data._id) ? "Added" : "Add"}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default FoodCard