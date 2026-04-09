import React from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUtensils } from "react-icons/fa";
import { useState } from 'react';
import { useRef } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { setActiveShop, setMyShops } from '../redux/ownerSlice';
import { ClipLoader } from 'react-spinners';

function CreateEditShop() {
    const navigate = useNavigate()
    const { activeShop, myShops } = useSelector(state => state.owner)
    const { currentCity,currentState,currentAddress } = useSelector(state => state.user)
    
    const [name,setName]=useState(activeShop?.name || "")
    const [address,setAddress]=useState(activeShop?.address || currentAddress || "")
    const [city,setCity]=useState(activeShop?.city || currentCity || "")
    const [state,setState]=useState(activeShop?.state || currentState || "")
    const [frontendImage,setFrontendImage]=useState(activeShop?.image || null)
    const [backendImage,setBackendImage]=useState(null)
    const [loading,setLoading]=useState(false)
    const dispatch=useDispatch()

    const handleImage=(e)=>{
        const file=e.target.files[0]
        if (file) {
            setBackendImage(file)
            setFrontendImage(URL.createObjectURL(file))
        }
    }

    const handleSubmit=async (e)=>{
        e.preventDefault()
        setLoading(true)
        try {
           const formData=new FormData()
           formData.append("name",name) 
           formData.append("city",city) 
           formData.append("state",state) 
           formData.append("address",address) 
           if(backendImage){
            formData.append("image",backendImage)
           }

           let result;
           if (activeShop && !e.nativeEvent.submitter.className.includes('bg-green-500')) {
               // EDIT existing active shop
               formData.append("shopId", activeShop._id)
               result = await axios.post(`${serverUrl}/api/shop/edit`, formData, { withCredentials: true })
               const updatedShops = myShops.map(s => s._id === result.data._id ? result.data : s)
               dispatch(setMyShops(updatedShops))
               dispatch(setActiveShop(result.data))
           } else {
               // CREATE new shop
               result = await axios.post(`${serverUrl}/api/shop/create`, formData, { withCredentials: true })
               const updatedShops = [...myShops, result.data]
               dispatch(setMyShops(updatedShops))
               dispatch(setActiveShop(result.data))
           }

           setLoading(false)
           navigate("/")
        } catch (error) {
            console.error("Shop operation error:", error)
            setLoading(false)
        }
    }
    return (
        <div className='flex justify-center flex-col items-center p-6 bg-gradient-to-br from-orange-50 relative to-white min-h-screen'>
            <div className='absolute top-[20px] left-[20px] z-[10] mb-[10px]' onClick={() => navigate("/")}>
                <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
            </div>

            <div className='max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100'>
                <div className='flex flex-col items-center mb-6'>
                    <div className='bg-orange-100 p-4 rounded-full mb-4'>
                        <FaUtensils className='text-[#ff4d2d] w-16 h-16' />
                    </div>
                    <div className="text-3xl font-extrabold text-gray-900">
                        {activeShop ? "Manage Shop" : "Add Your Restaurant"}
                    </div>
                    <p className='text-gray-500 text-sm mt-2 text-center'>
                        Fill in the details to {activeShop ? "update your existing shop" : "create a new branch in a different city"}
                    </p>
                </div>
                <form className='space-y-5' onSubmit={handleSubmit}>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Shop Name</label>
                        <input type="text" placeholder='Enter Shop Name' className='w-full px-4 py-2 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#ff4d2d] transition-all'
                        onChange={(e)=>setName(e.target.value)}
                        required
                        value={name}
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Shop Image</label>
                        <input type="file" accept='image/*' className='w-full px-4 py-2 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#ff4d2d] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-[#ff4d2d] hover:file:bg-orange-100' onChange={handleImage}  />
                        {frontendImage &&   <div className='mt-4 relative'>
                            <img src={frontendImage} alt="" className='w-full h-48 object-cover rounded-xl border-2 border-orange-50 shadow-md'/>
                            <div className='absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-gray-500'>Preview</div>
                        </div>}
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                           <label className='block text-sm font-medium text-gray-700 mb-1'>City</label>
                        <input type="text" placeholder='e.g. Mathura' className='w-full px-4 py-2 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#ff4d2d] transition-all' onChange={(e)=>setCity(e.target.value)}
                        required
                        value={city}/> 
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>State</label>
                        <input type="text" placeholder='e.g. Uttar Pradesh' className='w-full px-4 py-2 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#ff4d2d] transition-all' onChange={(e)=>setState(e.target.value)}
                        required
                        value={state}/> 
                        </div>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Full Address</label>
                        <textarea placeholder='Enter Shop Full Address' className='w-full px-4 py-2 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#ff4d2d] transition-all h-24 resize-none' onChange={(e)=>setAddress(e.target.value)}
                        required
                        value={address}/> 
                    </div>
                    
                    <div className='flex flex-col gap-3 pt-4'>
                        <button 
                            type="submit" 
                            className='w-full bg-[#ff4d2d] text-white px-6 py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-orange-600 hover:shadow-orange-200 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50' 
                            disabled={loading}
                        >
                            {loading ? <ClipLoader size={20} color='white'/> : (activeShop ? "UPDATE SHOP" : "CREATE NEW SHOP")}
                        </button>
                        
                        {activeShop && (
                            <button 
                                type="submit"
                                className='w-full bg-green-500 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2'
                            >
                                <FaPlus size={14} /> ADD AS NEW SHOP BRANCH
                            </button>
                        )}
                    </div>
                </form>
            </div>
                
                

        </div>
    )
}

export default CreateEditShop
