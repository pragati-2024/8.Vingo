// // import React, { useEffect, useState } from 'react'
// // import { FaLocationDot } from "react-icons/fa6";
// // import { IoIosSearch } from "react-icons/io";
// // import { FiShoppingCart } from "react-icons/fi";
// // import { useDispatch, useSelector } from 'react-redux';
// // import { RxCross2 } from "react-icons/rx";
// // import axios from 'axios';
// // import { serverUrl } from '../App';
// // import { setSearchItems, setUserData } from '../redux/userSlice';
// // import { FaPlus } from "react-icons/fa6";
// // import { TbReceipt2 } from "react-icons/tb";
// // import { useNavigate } from 'react-router-dom';
// // function Nav() {
// //     const { userData, currentCity ,cartItems} = useSelector(state => state.user)
// //         const { myShopData} = useSelector(state => state.owner)
// //     const [showInfo, setShowInfo] = useState(false)
// //     const [showSearch, setShowSearch] = useState(false)
// //     const [query,setQuery]=useState("")
// //     const dispatch = useDispatch()
// //     const navigate=useNavigate()
// //     const handleLogOut = async () => {
// //         try {
// //             const result = await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
// //             dispatch(setUserData(null))
// //         } catch (error) {
// //             console.log(error)
// //         }
// //     }

// //     const handleSearchItems=async () => {
// //       try {
// //         const result=await axios.get(`${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`,{withCredentials:true})
// //     dispatch(setSearchItems(result.data))
// //       } catch (error) {
// //         console.log(error)
// //       }
// //     }

// //     useEffect(()=>{
// //         if(query){
// // handleSearchItems()
// //         }else{
// //               dispatch(setSearchItems(null))
// //         }

// //     },[query])
// //     return (
// //         <div className='w-full h-[80px] flex items-center justify-between md:justify-center gap-[30px] px-[20px] fixed top-0 z-[9999] bg-[#fff9f6] overflow-visible'>

// //             {showSearch && userData.role == "user" && <div className='w-[90%] h-[70px]  bg-white shadow-xl rounded-lg items-center gap-[20px] flex fixed top-[80px] left-[5%] md:hidden'>
// //                 <div className='flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400'>
// //                     <FaLocationDot size={25} className=" text-[#ff4d2d]" />
// //                     <div className='w-[80%] truncate text-gray-600'>{currentCity}</div>
// //                 </div>
// //                 <div className='w-[80%] flex items-center gap-[10px]'>
// //                     <IoIosSearch size={25} className='text-[#ff4d2d]' />
// //                     <input type="text" placeholder='search delicious food...' className='px-[10px] text-gray-700 outline-0 w-full' onChange={(e)=>setQuery(e.target.value)} value={query}/>
// //                 </div>
// //             </div>}



// //             <h1 className='text-3xl font-bold mb-2 text-[#ff4d2d]'>Vingo</h1>
// //             {userData.role == "user" && <div className='md:w-[60%] lg:w-[40%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] hidden md:flex'>
// //                 <div className='flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400'>
// //                     <FaLocationDot size={25} className=" text-[#ff4d2d]" />
// //                     <div className='w-[80%] truncate text-gray-600'>{currentCity}</div>
// //                 </div>
// //                 <div className='w-[80%] flex items-center gap-[10px]'>
// //                     <IoIosSearch size={25} className='text-[#ff4d2d]' />
// //                     <input type="text" placeholder='search delicious food...' className='px-[10px] text-gray-700 outline-0 w-full' onChange={(e)=>setQuery(e.target.value)} value={query}/>
// //                 </div>
// //             </div>}

// //             <div className='flex items-center gap-4'>
// //                 {userData.role == "user" && (showSearch ? <RxCross2 size={25} className='text-[#ff4d2d] md:hidden' onClick={() => setShowSearch(false)} /> : <IoIosSearch size={25} className='text-[#ff4d2d] md:hidden' onClick={() => setShowSearch(true)} />)
// //                 }
// //                 {userData.role == "owner"? <>
// //                  {myShopData && <> <button className='hidden md:flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]' onClick={()=>navigate("/add-item")}>
// //                         <FaPlus size={20} />
// //                         <span>Add Food Item</span>
// //                     </button>
// //                       <button className='md:hidden flex items-center  p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]' onClick={()=>navigate("/add-item")}>
// //                         <FaPlus size={20} />
// //                     </button></>}
                   
// //                     <div className='hidden md:flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium' onClick={()=>navigate("/my-orders")}>
// //                       <TbReceipt2 size={20}/>
// //                       <span>My Orders</span>
                      
// //                     </div>
// //                      <div className='md:hidden flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium' onClick={()=>navigate("/my-orders")}>
// //                       <TbReceipt2 size={20}/>
                      
// //                     </div>
// //                 </>: (
// //                     <>
// //                  {userData.role=="user" &&    <div className='relative cursor-pointer' onClick={()=>navigate("/cart")}>
// //                     <FiShoppingCart size={25} className='text-[#ff4d2d]' />
// //                     <span className='absolute right-[-9px] top-[-12px] text-[#ff4d2d]'>{cartItems.length}</span>
// //                 </div>}   
           


// //                 <button className='hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium' onClick={()=>navigate("/my-orders")}>
// //                     My Orders
// //                 </button>
// //                     </>
// //                 )}



// //                 <div className='w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[18px] shadow-xl font-semibold cursor-pointer' onClick={() => setShowInfo(prev => !prev)}>
// //                     {userData?.fullName.slice(0, 1)}
// //                 </div>
// //                 {showInfo && <div className={`fixed top-[80px] right-[10px] 
// //                     ${userData.role=="deliveryBoy"?"md:right-[20%] lg:right-[40%]":"md:right-[10%] lg:right-[25%]"} w-[180px] bg-white shadow-2xl rounded-xl p-[20px] flex flex-col gap-[10px] z-[9999]`}>
// //                     <div className='text-[17px] font-semibold'>{userData.fullName}</div>
// //                     {userData.role=="user" && <div className='md:hidden text-[#ff4d2d] font-semibold cursor-pointer' onClick={()=>navigate("/my-orders")}>My Orders</div>}
                    
// //                     <div className='text-[#ff4d2d] font-semibold cursor-pointer' onClick={handleLogOut}>Log Out</div>
// //                 </div>}

// //             </div>
// //         </div>
// //     )
// // }


// // export default Nav


// import React, { useEffect, useState } from 'react'
// import { FaLocationDot } from "react-icons/fa6";
// import { IoIosSearch } from "react-icons/io";
// import { FiShoppingCart } from "react-icons/fi";
// import { useDispatch, useSelector } from 'react-redux';
// import { RxCross2 } from "react-icons/rx";
// import axios from 'axios';
// import { serverUrl } from '../App';
// import { setSearchItems, setUserData, setCurrentCity } from '../redux/userSlice'; // ⭐ added
// import { FaPlus } from "react-icons/fa6";
// import { TbReceipt2 } from "react-icons/tb";
// import { useNavigate } from 'react-router-dom';

// function Nav() {

//     const { userData, currentCity ,cartItems} = useSelector(state => state.user)
//     const { myShopData} = useSelector(state => state.owner)

//     const [showInfo, setShowInfo] = useState(false)
//     const [showSearch, setShowSearch] = useState(false)
//     const [query,setQuery]=useState("")

//     const dispatch = useDispatch()
//     const navigate=useNavigate()

//     const handleLogOut = async () => {
//         try {
//             const result = await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
//             dispatch(setUserData(null))
//         } catch (error) {
//             console.log(error)
//         }
//     }

//     const handleSearchItems=async () => {
//       try {
//         const result=await axios.get(`${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`,{withCredentials:true})
//         dispatch(setSearchItems(result.data))
//       } catch (error) {
//         console.log(error)
//       }
//     }

//     // ⭐ FIXED PART
//     useEffect(()=>{
//         if(query){
//             dispatch(setCurrentCity(query))   // ⭐ THIS LINE ADDED
//             handleSearchItems()
//         }else{
//             dispatch(setSearchItems(null))
//         }
//     },[query])

//     return (
//         <div className='w-full h-[80px] flex items-center justify-between md:justify-center gap-[30px] px-[20px] fixed top-0 z-[9999] bg-[#fff9f6] overflow-visible'>

//             {showSearch && userData.role == "user" && <div className='w-[90%] h-[70px]  bg-white shadow-xl rounded-lg items-center gap-[20px] flex fixed top-[80px] left-[5%] md:hidden'>
//                 <div className='flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400'>
//                     <FaLocationDot size={25} className=" text-[#ff4d2d]" />
//                     <div className='w-[80%] truncate text-gray-600'>{currentCity}</div>
//                 </div>
//                 <div className='w-[80%] flex items-center gap-[10px]'>
//                     <IoIosSearch size={25} className='text-[#ff4d2d]' />
//                     <input type="text" placeholder='search delicious food...' className='px-[10px] text-gray-700 outline-0 w-full' onChange={(e)=>setQuery(e.target.value)} value={query}/>
//                 </div>
//             </div>}

//             <h1 className='text-3xl font-bold mb-2 text-[#ff4d2d]'>Vingo</h1>

//             {userData.role == "user" && <div className='md:w-[60%] lg:w-[40%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] hidden md:flex'>
//                 <div className='flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400'>
//                     <FaLocationDot size={25} className=" text-[#ff4d2d]" />
//                     <div className='w-[80%] truncate text-gray-600'>{currentCity}</div>
//                 </div>
//                 <div className='w-[80%] flex items-center gap-[10px]'>
//                     <IoIosSearch size={25} className='text-[#ff4d2d]' />
//                     <input type="text" placeholder='search delicious food...' className='px-[10px] text-gray-700 outline-0 w-full' onChange={(e)=>setQuery(e.target.value)} value={query}/>
//                 </div>
//             </div>}

//             <div className='flex items-center gap-4'>

//                 {userData.role == "user" && (
//                     showSearch
//                     ? <RxCross2 size={25} className='text-[#ff4d2d] md:hidden' onClick={() => setShowSearch(false)} />
//                     : <IoIosSearch size={25} className='text-[#ff4d2d] md:hidden' onClick={() => setShowSearch(true)} />
//                 )}

//                 {userData.role == "owner"? <>
//                  {myShopData && <>
//                     <button className='hidden md:flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]' onClick={()=>navigate("/add-item")}>
//                         <FaPlus size={20} />
//                         <span>Add Food Item</span>
//                     </button>
//                     <button className='md:hidden flex items-center p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]' onClick={()=>navigate("/add-item")}>
//                         <FaPlus size={20} />
//                     </button>
//                  </>}
                   
//                     <div className='hidden md:flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium' onClick={()=>navigate("/my-orders")}>
//                       <TbReceipt2 size={20}/>
//                       <span>My Orders</span>
//                     </div>

//                     <div className='md:hidden flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium' onClick={()=>navigate("/my-orders")}>
//                       <TbReceipt2 size={20}/>
//                     </div>

//                 </>: (
//                     <>
//                         {userData.role=="user" &&    
//                         <div className='relative cursor-pointer' onClick={()=>navigate("/cart")}>
//                             <FiShoppingCart size={25} className='text-[#ff4d2d]' />
//                             <span className='absolute right-[-9px] top-[-12px] text-[#ff4d2d]'>{cartItems.length}</span>
//                         </div>}   

//                         <button className='hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium' onClick={()=>navigate("/my-orders")}>
//                             My Orders
//                         </button>
//                     </>
//                 )}

//                 <div className='w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[18px] shadow-xl font-semibold cursor-pointer' onClick={() => setShowInfo(prev => !prev)}>
//                     {userData?.fullName.slice(0, 1)}
//                 </div>

//                 {showInfo && <div className={`fixed top-[80px] right-[10px] 
//                     ${userData.role=="deliveryBoy"?"md:right-[20%] lg:right-[40%]":"md:right-[10%] lg:right-[25%]"} 
//                     w-[180px] bg-white shadow-2xl rounded-xl p-[20px] flex flex-col gap-[10px] z-[9999]`}>

//                     <div className='text-[17px] font-semibold'>{userData.fullName}</div>

//                     {userData.role=="user" && 
//                     <div className='md:hidden text-[#ff4d2d] font-semibold cursor-pointer' onClick={()=>navigate("/my-orders")}>
//                         My Orders
//                     </div>}

//                     <div className='text-[#ff4d2d] font-semibold cursor-pointer' onClick={handleLogOut}>
//                         Log Out
//                     </div>
//                 </div>}

//             </div>
//         </div>
//     )
// }

// export default Nav



import React, { useEffect, useState } from 'react'
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import { RxCross2 } from "react-icons/rx";
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { serverUrl } from '../App';
import { setSearchItems, setUserData, setCurrentCity } from '../redux/userSlice';
import { setActiveShop } from '../redux/ownerSlice';
import { FaPlus } from "react-icons/fa6";
import { TbReceipt2 } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';

function Nav() {

    const { userData, currentCity ,cartItems} = useSelector(state => state.user)
    const { activeShop } = useSelector(state => state.owner)

    const [showInfo, setShowInfo] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [query,setQuery]=useState("")

    const dispatch = useDispatch()
    const navigate=useNavigate()

    // ✅ FIXED LOGOUT
    const handleLogOut = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })

            dispatch(setUserData(null))
            setShowInfo(false)   // 🔥 added
            navigate("/signin")  // 🔥 added

        } catch (error) {
            console.log(error)
        }
    }

    const handleSearchItems=async () => {
      try {
        const result=await axios.get(`${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`,{withCredentials:true})
        dispatch(setSearchItems(result.data))
      } catch (error) {
        console.log(error)
      }
    }

    useEffect(()=>{
        if(query){
            handleSearchItems()
        }else{
            dispatch(setSearchItems(null))
        }
    },[query])

    return (
        <div className='w-full h-[80px] flex items-center justify-between md:justify-center gap-[30px] px-[20px] fixed top-0 z-[9999] bg-white/10 backdrop-blur-md border-b border-white/10 overflow-visible'>

            {showSearch && userData?.role == "user" && 
            <div className='w-[90%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] flex fixed top-[80px] left-[5%] md:hidden'>
                <div className='flex items-center w-[40%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400'>
                    <FaLocationDot size={25} className=" text-[#ff4d2d]" />
                    <input 
                        type="text" 
                        placeholder='City...' 
                        className='w-full text-gray-700 outline-0 font-bold' 
                        value={currentCity} 
                        onChange={(e) => dispatch(setCurrentCity(e.target.value))}
                    />
                </div>
                <div className='w-[60%] flex items-center gap-[10px]'>
                    <IoIosSearch size={25} className='text-[#ff4d2d]' />
                    <input type="text" placeholder='food...' className='px-[10px] text-gray-700 outline-0 w-full' onChange={(e)=>setQuery(e.target.value)} value={query}/>
                </div>
            </div>}

            <h1 className='text-3xl font-bold mb-2 text-[#ff4d2d] cursor-pointer' onClick={() => navigate("/")}>Vingo</h1>
            
            {userData?.role == "user" && 
            <div className='md:w-[60%] lg:w-[45%] h-[60px] bg-white shadow-lg rounded-full items-center gap-[10px] hidden md:flex px-6 border border-gray-100'>
                <div className='flex items-center w-[35%] overflow-hidden gap-[10px] border-r border-gray-200 pr-2'>
                    <FaLocationDot size={20} className=" text-[#ff4d2d] flex-shrink-0" />
                    <input 
                        type="text" 
                        placeholder='Select City' 
                        className='w-full text-gray-700 outline-0 font-bold text-sm' 
                        value={currentCity} 
                        onChange={(e) => dispatch(setCurrentCity(e.target.value))}
                    />
                </div>
                <div className='w-[65%] flex items-center gap-[10px] pl-2'>
                    <IoIosSearch size={22} className='text-gray-400' />
                    <input 
                        type="text" 
                        placeholder='Search for restaurant, cuisine or a dish' 
                        className='text-gray-700 outline-0 w-full text-sm' 
                        onChange={(e)=>setQuery(e.target.value)} 
                        value={query}
                    />
                </div>
            </div>}

            <div className='flex items-center gap-4'>

                {userData?.role == "user" && (
                    showSearch
                    ? <RxCross2 size={25} className='text-[#ff4d2d] md:hidden cursor-pointer' onClick={() => setShowSearch(false)} />
                    : <IoIosSearch size={25} className='text-[#ff4d2d] md:hidden cursor-pointer' onClick={() => setShowSearch(true)} />
                )}

                {userData?.role == "owner"? <>
                    <button className='hidden md:flex items-center gap-1 p-2 cursor-pointer rounded-full bg-green-500/10 text-green-600 font-medium' onClick={() => { dispatch(setActiveShop(null)); navigate("/create-edit-shop"); }}>
                        <FaPlus size={20} />
                        <span>Add New Shop</span>
                    </button>
                    
                 {activeShop && <>
                    <button className='hidden md:flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]' onClick={()=>navigate("/add-item")}>
                        <FaPlus size={20} />
                        <span>Add Food Item</span>
                    </button>
                    <button className='md:hidden flex items-center p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]' onClick={()=>navigate("/add-item")}>
                        <FaPlus size={20} />
                    </button>
                 </>}
                   
                    <div className='hidden md:flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium' onClick={()=>navigate("/my-orders")}>
                      <TbReceipt2 size={20}/>
                      <span>My Orders</span>
                    </div>

                    <div className='md:hidden flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium' onClick={()=>navigate("/my-orders")}>
                      <TbReceipt2 size={20}/>
                    </div>

                </>: (
                    <>
                        {userData?.role=="user" &&    
                        <motion.div 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className='relative cursor-pointer group' 
                            onClick={()=>navigate("/cart")}
                        >
                            <FiShoppingCart size={25} className='text-[#ff4d2d] group-hover:drop-shadow-lg transition-all' />
                            <AnimatePresence>
                                {cartItems.length > 0 && (
                                    <motion.span 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        key={cartItems.length}
                                        className='absolute right-[-10px] top-[-10px] bg-gray-900 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white'
                                    >
                                        {cartItems.length}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.div>}   

                        <button className='hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium' onClick={()=>navigate("/my-orders")}>
                            My Orders
                        </button>
                    </>
                )}

                {/* ✅ SAFE FIX */}
                <div className='w-[40px] h-[40px] rounded-full flex items-center justify-center bg-gradient-to-br from-[#ff416c] to-[#ff4b2b] text-white text-[18px] shadow-lg font-black cursor-pointer hover:scale-105 transition-all' onClick={() => setShowInfo(prev => !prev)}>
                    {userData?.fullName?.slice(0, 1)}
                </div>

                <AnimatePresence>
                {showInfo && 
                <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className={`fixed top-[90px] right-[20px] 
                    ${userData?.role=="deliveryBoy"?"md:right-[20%] lg:right-[40%]":"md:right-[10%] lg:right-[15%]"} 
                    w-[220px] bg-white/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2rem] p-6 flex flex-col gap-4 z-[9999] border border-white/50`}>

                    <div className='flex flex-col'>
                        <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Logged in as</span>
                        <div className='text-lg font-black text-gray-900 truncate'>{userData?.fullName}</div>
                    </div>

                    <div className='h-[1px] bg-gray-100 w-full'></div>

                    <div className='flex flex-col gap-2'>
                        {userData?.role=="user" && 
                        <button 
                            className='flex items-center gap-3 text-gray-600 font-bold hover:text-[#ff4d2d] transition-all p-2 rounded-xl hover:bg-orange-50' 
                            onClick={()=>{ navigate("/my-orders"); setShowInfo(false); }}
                        >
                            <TbReceipt2 size={20} />
                            <span>My Orders</span>
                        </button>}

                        <button 
                            className='flex items-center gap-3 text-red-500 font-bold hover:bg-red-50 transition-all p-2 rounded-xl' 
                            onClick={handleLogOut}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Log Out</span>
                        </button>
                    </div>
                </motion.div>}
                </AnimatePresence>

            </div>
        </div>
    )
}

export default Nav




