import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setMyOrders, setUserData, setLoadingOrders } from '../redux/userSlice'

function useGetMyOrders() {
    const dispatch=useDispatch()
    const {userData}=useSelector(state=>state.user)
  useEffect(()=>{
  const fetchOrders=async () => {
    try {
           dispatch(setLoadingOrders(true))
           const result=await axios.get(`${serverUrl}/api/order/my-orders`,{withCredentials:true})
            dispatch(setMyOrders(result.data))
    } catch (error) {
        console.log(error)
    } finally {
        dispatch(setLoadingOrders(false))
    }
}
  fetchOrders()

 
  
  },[userData])
}

export default useGetMyOrders