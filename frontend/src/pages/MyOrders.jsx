import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import { setMyOrders, updateOrderStatus, updateRealtimeOrderStatus } from '../redux/userSlice';


function MyOrders() {
  const { userData, myOrders, socket, loadingOrders } = useSelector(state => state.user)
  const { activeShop } = useSelector(state => state.owner)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const filteredOrders = (userData?.role === 'owner' && activeShop)
    ? (Array.isArray(myOrders) ? myOrders.filter(order => {
        const orderShopId = order.shopOrder?.shop?._id?.toString() || order.shopOrder?.shop?.toString();
        const activeShopId = activeShop?._id?.toString() || activeShop?.id?.toString();
        return orderShopId === activeShopId;
      }) : [])
    : (Array.isArray(myOrders) ? myOrders : []);

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (data) => {
      dispatch(addMyOrder(data))
    }

    socket.on('newOrder', handleNewOrder)

    socket.on('update-status', ({ orderId, shopId, status, userId }) => {
      if (userId == userData?._id) {
        dispatch(updateRealtimeOrderStatus({ orderId, shopId, status }))
      }
    })

    socket.on('orderAccepted', ({ orderId, shopId, deliveryBoy }) => {
      if (userData?.role === 'owner') {
        dispatch(updateRealtimeOrderStatus({ orderId, shopId, status: 'accepted', deliveryBoy }))
      }
    })

    return () => {
      socket.off('newOrder', handleNewOrder)
      socket.off('update-status')
      socket.off('orderAccepted')
    }
  }, [socket, userData?._id, dispatch])

  if (loadingOrders) {
    return (
      <div className='w-full min-h-screen flex items-center justify-center bg-[#fffcf8]'>
        <div className='w-12 h-12 border-4 border-[#ff4d2d] border-t-transparent rounded-full animate-spin'></div>
      </div>
    )
  }

  return (
    <div className='w-full min-h-screen bg-[#fffcf8] flex justify-center px-4'>
      <div className='w-full max-w-[800px] p-4 bg-white/95 backdrop-blur-[2px] shadow-2xl rounded-3xl my-10 border border-gray-100/50 subtle-star-pattern'>
        <div className='p-6'>
          <div className='flex items-center gap-[20px] mb-8'>
            <div className='z-[10] cursor-pointer hover:scale-110 transition-transform' onClick={() => navigate("/")}>
              <IoIosArrowRoundBack size={40} className='text-[#ff4d2d]' />
            </div>
            <h1 className='text-3xl font-black text-gray-900 tracking-tighter uppercase'>My Orders</h1>
          </div>
          <div className='space-y-6'>
            {filteredOrders.length === 0 && (
              <div className='text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200'>
                <p className='text-gray-400 font-bold uppercase tracking-widest text-xs italic'>No orders found {userData?.role === 'owner' ? `for ${activeShop?.name || 'your shop'}` : ''} yet 😔</p>
                <button onClick={() => navigate("/")} className='mt-4 text-[#ff4d2d] font-black uppercase text-[10px] tracking-[0.2em] border-b border-[#ff4d2d] pb-0.5'>
                  {userData?.role === 'owner' ? 'Wait for customers' : 'Start Ordering Now'}
                </button>
              </div>
            )}
            {filteredOrders.map((order, index) => (
              userData?.role == "user" ?
                (
                  <UserOrderCard data={order} key={order._id || index} />
                )
                :
                userData?.role == "owner" ? (
                  <OwnerOrderCard data={order} key={order._id || index} />
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