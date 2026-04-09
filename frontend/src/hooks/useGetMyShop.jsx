import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import { setMyShops } from '../redux/ownerSlice'

function useGetMyshop() {
    const dispatch=useDispatch()
    const {userData}=useSelector(state=>state.user)
  useEffect(()=>{
  if(userData?.role === 'owner'){
    const fetchShop=async () => {
        try {
               const result=await axios.get(`${serverUrl}/api/shop/get-my`,{withCredentials:true})
                dispatch(setMyShops(result.data))
      
        } catch (error) {
            console.log(error)
        }
    }
    fetchShop()
  }
 
  },[userData])
}

export default useGetMyshop
