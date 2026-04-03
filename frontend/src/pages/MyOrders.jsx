import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import { setMyOrders, updateOrderStatus, updateRealtimeOrderStatus } from '../redux/userSlice';


function MyOrders() {
  const { userData, myOrders,socket} = useSelector(state => state.user)
  const { activeShop } = useSelector(state => state.owner)
  const navigate = useNavigate()
  const dispatch=useDispatch()

  const filteredOrders = (userData?.role === 'owner' && activeShop)
    ? myOrders.filter(order => order.shopOrder?.shop?._id === activeShop._id)
    : myOrders;

  useEffect(()=>{
socket?.on('newOrder',(data)=>{
  // Check if the incoming order belongs to ANY of the owner's shops
  // For simplicity, we just add it to the general list
  if (Array.isArray(myOrders)) {
    dispatch(setMyOrders([data,...myOrders]))
  }
})

socket?.on('update-status',({orderId,shopId,status,userId})=>{
if(userId==userData._id){
  dispatch(updateRealtimeOrderStatus({orderId,shopId,status}))
}
})

socket?.on('orderAccepted', ({ orderId, shopId, deliveryBoy }) => {
  if (userData.role === 'owner') {
    // Update the specific order in state with the assigned delivery boy
    const updatedOrders = myOrders.map(order => {
      if (order._id === orderId && order.shopOrder.shop._id === shopId) {
        return {
          ...order,
          shopOrder: {
            ...order.shopOrder,
            assignedDeliveryBoy: deliveryBoy
          }
        }
      }
      return order
    })
    dispatch(setMyOrders(updatedOrders))
  }
})

return ()=>{
  socket?.off('newOrder')
  socket?.off('update-status')
  socket?.off('orderAccepted')
}
  },[socket, myOrders, userData._id, dispatch])



  
  return (
    <div className='w-full min-h-screen bg-transparent flex justify-center px-4'>
      <div className='w-full max-w-[800px] p-4 bg-white/95 backdrop-blur-[2px] shadow-2xl rounded-3xl my-10 border border-gray-100/50 subtle-star-pattern'>
        <div className='p-6'>
          <div className='flex items-center gap-[20px] mb-8'>
            <div className='z-[10] cursor-pointer hover:scale-110 transition-transform' onClick={() => navigate("/")}>
              <IoIosArrowRoundBack size={40} className='text-[#ff4d2d]' />
            </div>
            <h1 className='text-3xl font-black text-gray-900 tracking-tighter uppercase'>My Orders</h1>
          </div>
          <div className='space-y-6'>
            {filteredOrders?.length === 0 && (
              <div className='text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200'>
                <p className='text-gray-400 font-bold uppercase tracking-widest text-xs italic'>No orders found {userData.role === 'owner' ? `for ${activeShop?.name}` : ''} yet 😔</p>
                <button onClick={()=>navigate("/")} className='mt-4 text-[#ff4d2d] font-black uppercase text-[10px] tracking-[0.2em] border-b border-[#ff4d2d] pb-0.5'>Start Ordering Now</button>
              </div>
            )}
            {filteredOrders?.map((order,index)=>(
              userData.role=="user" ?
              (
                <UserOrderCard data={order} key={index}/>
              )
              :
              userData.role=="owner"? (
                <OwnerOrderCard data={order} key={index}/>
              )
              :
              null
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyOrders
