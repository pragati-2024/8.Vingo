// import axios from 'axios'
// import React, { useEffect } from 'react'
// import { serverUrl } from '../App'
// import { useDispatch, useSelector } from 'react-redux'
// import { setShopsInMyCity, setUserData } from '../redux/userSlice'

// function useGetShopByCity() {
//     const dispatch=useDispatch()
//     const {currentCity}=useSelector(state=>state.user)
//   useEffect(()=>{
//   const fetchShops=async () => {
//     try {
//            const result=await axios.get(`${serverUrl}/api/shop/get-by-city/${currentCity}`,{withCredentials:true})
//             dispatch(setShopsInMyCity(result.data))
//            console.log(result.data)
//     } catch (error) {
//         console.log(error)
//     }
// }
// fetchShops()
 
//   },[currentCity])
// }

// export default useGetShopByCity


import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setShopsInMyCity } from '../redux/userSlice'

function useGetShopByCity() {

    const dispatch = useDispatch()
    const { currentCity } = useSelector(state => state.user)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Fallback to "Mathura" if city is empty or invalid
        const targetCity = currentCity?.trim().toLowerCase() || "mathura"

        const fetchShops = async () => {
            setLoading(true)
            setError(null)
            try {
                // Backend is case-insensitive usually, but ensure consistency
                const result = await axios.get(
                    `${serverUrl}/api/shop/get-by-city/${targetCity}`,
                    { withCredentials: true }
                )

                dispatch(setShopsInMyCity(result.data))
                console.log(`Fetched shops for ${targetCity}:`, result.data)

            } catch (error) {
                console.error(`Error fetching shops for ${targetCity}:`, error)
                setError(error.message)
                dispatch(setShopsInMyCity([])) // Prevent stale data
            } finally {
                setLoading(false)
            }
        }

        fetchShops()

    }, [currentCity])

    return { loading, error }
}

export default useGetShopByCity