import React, { useEffect } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { FaUtensils, FaPen } from "react-icons/fa";
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRef } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { setActiveShop, setMyShops } from '../redux/ownerSlice';
import { ClipLoader } from 'react-spinners';
import SearchableCategorySelect from '../components/SearchableCategorySelect';
function EditItem() {
    const navigate = useNavigate()
    const { activeShop, myShops } = useSelector(state => state.owner)
  const {itemId}=useParams()
   const [currentItem,setCurrentItem]=useState(null)
    const [name, setName] = useState("")
    const [price, setPrice] = useState(0)
    const [frontendImage, setFrontendImage] = useState("")
    const [backendImage, setBackendImage] = useState(null)
    const [category, setCategory] = useState("")
    const [foodType, setFoodType] = useState("")
   const [loading,setLoading]=useState(false)
    const categories = ["Snacks",
        "Main Course",
        "Desserts",
        "Pizza",
        "Burgers",
        "Sandwiches",
        "South Indian",
        "North Indian",
        "Chinese",
        "Fast Food",
        "Others"]
    const dispatch = useDispatch()
    const handleImage = (e) => {
        const file = e.target.files[0]
        setBackendImage(file)
        setFrontendImage(URL.createObjectURL(file))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("name",name)
            formData.append("category",category)
            formData.append("foodType", foodType)
            formData.append("price", price)
            formData.append("shopId", activeShop._id) // 🔥 Send current shop ID
            if (backendImage) {
                formData.append("image", backendImage)
            }
            const result = await axios.post(`${serverUrl}/api/item/edit-item/${itemId}`, formData, { withCredentials: true })
            
            // 🔥 Correctly replace the whole shop object in the list
            const updatedShops = myShops.map(shop => 
                shop._id === activeShop._id ? result.data : shop
            )
            
            dispatch(setMyShops(updatedShops))
            dispatch(setActiveShop(result.data))

            setLoading(false)
            navigate("/")
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

    useEffect(()=>{
  const handleGetItemById=async () => {
    try {
       const result=await axios.get(`${serverUrl}/api/item/get-by-id/${itemId}`,{withCredentials:true}) 
       setCurrentItem(result.data)

    } catch (error) {
        console.log(error)
    }
  }
  handleGetItemById()
    },[itemId])

    useEffect(()=>{
     setName(currentItem?.name || "")
     setPrice(currentItem?.price || 0)
     setCategory(currentItem?.category || "")
     setFoodType(currentItem?.foodType || "")
     setFrontendImage(currentItem?.image || "")
    },[currentItem])
    return (
        <div className='flex justify-center flex-col items-center p-6 subtle-star-pattern bg-white/95 backdrop-blur-[2px] min-h-screen pt-20'>
            <div className='absolute top-8 left-8 z-[10] cursor-pointer hover:scale-110 transition-transform' onClick={() => navigate("/")}>
                <div className='bg-white shadow-lg p-2 rounded-full border border-gray-100'>
                    <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
                </div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='max-w-xl w-full bg-white shadow-2xl rounded-[40px] p-10 md:p-12 border border-gray-100 relative overflow-hidden'
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/50 rounded-bl-[100px] -mr-10 -mt-10" />
                
                <div className='flex flex-col items-center mb-10 relative z-10'>
                    <div className='bg-orange-50 p-6 rounded-[32px] mb-6 shadow-sm border border-orange-100'>
                        <FaPen className='text-[#ff4d2d] w-12 h-12' />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter text-center">
                        Edit <span className="text-[#ff4d2d]">Dish</span>
                    </h1>
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-2">Update your menu item</p>
                </div>

                <form className='space-y-8 relative z-10' onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className='block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1'>Dish Name</label>
                        <input type="text" placeholder='e.g. Spicy Paneer Pizza' className='w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-[#ff4d2d] focus:bg-white transition-all font-bold text-gray-800'
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className='block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1'>Price (₹)</label>
                        <input type="number" placeholder='Enter price' className='w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-[#ff4d2d] focus:bg-white transition-all font-bold text-gray-800'
                            onChange={(e) => setPrice(e.target.value)}
                            value={price}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className='block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1'>Update Image (Optional)</label>
                        <div className="relative group">
                            <input type="file" accept='image/*' className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10' onChange={handleImage} />
                            <div className='w-full px-6 py-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center group-hover:border-[#ff4d2d] transition-all'>
                                <div className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Change dish photo</div>
                                <div className="text-[10px] text-gray-300">Leave empty to keep current</div>
                            </div>
                        </div>
                        {frontendImage && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className='mt-6'>
                                <img src={frontendImage} alt="Preview" className='w-full h-52 object-cover rounded-3xl border-4 border-white shadow-lg' />
                            </motion.div>
                        )}
                    </div>

                    <SearchableCategorySelect 
                        value={category}
                        onChange={(cat) => setCategory(cat)}
                        categories={categories}
                    />

                    <div className="space-y-4">
                        <label className='block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1'>Food Type</label>
                        <div className='flex gap-4'>
                            <button 
                                type="button"
                                onClick={() => setFoodType("veg")}
                                className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 ${foodType === 'veg' ? 'bg-green-50 border-green-500 text-green-600 shadow-md' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}
                            >
                                🥗 Veg
                            </button>
                            <button 
                                type="button"
                                onClick={() => setFoodType("non-veg")}
                                className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 ${foodType === 'non-veg' ? 'bg-red-50 border-red-500 text-red-600 shadow-md' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}
                            >
                                🍗 Non-Veg
                            </button>
                        </div>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className='w-full bg-gradient-to-r from-[#ff4d2d] to-[#ff7d2d] text-white py-6 rounded-3xl font-black text-lg shadow-[0_20px_40px_rgba(255,77,45,0.3)] hover:shadow-[0_25px_50px_rgba(255,77,45,0.4)] transition-all uppercase tracking-[0.2em] mt-10 disabled:opacity-50'
                    >
                        {loading ? <ClipLoader size={20} color='white' /> : "Update Dish"}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    )
}

export default EditItem
