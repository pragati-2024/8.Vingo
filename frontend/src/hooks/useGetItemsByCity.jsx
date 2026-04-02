import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setItemsInMyCity } from '../redux/userSlice'

function useGetItemsByCity() {
    const dispatch = useDispatch()
    const { currentCity } = useSelector(state => state.user)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Fallback to "Mathura" if city is empty or invalid
        const targetCity = currentCity?.trim().toLowerCase() || "mathura"

        const fetchItems = async () => {
            setLoading(true)
            setError(null)
            try {
                const result = await axios.get(
                    `${serverUrl}/api/item/get-by-city/${targetCity}`,
                    { withCredentials: true }
                )
                dispatch(setItemsInMyCity(result.data))
                console.log(`Fetched items for ${targetCity}:`, result.data)
            } catch (error) {
                console.error(`Error fetching items for ${targetCity}:`, error)
                setError(error.message)
                dispatch(setItemsInMyCity([])) // Prevent stale data
            } finally {
                setLoading(false)
            }
        }

        fetchItems()

    }, [currentCity])

    return { loading, error }
}

export default useGetItemsByCity
