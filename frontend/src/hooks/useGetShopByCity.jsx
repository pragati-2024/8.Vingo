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

import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../config";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentCity, setShopsInMyCity } from "../redux/userSlice";

function useGetShopByCity() {
  const dispatch = useDispatch();
  const { currentCity } = useSelector((state) => state.user);

  useEffect(() => {
    const targetCity = (currentCity || "").trim().toLowerCase() || "mathura";
    let isActive = true;
    const controller = new AbortController();
    const debounceMs = 350;

    let didFallback = false;

    const fetchShops = async () => {
      // Mark loading in store for screens that need a spinner
      dispatch(setShopsInMyCity(null));
      try {
        const result = await axios.get(
          `${serverUrl}/api/shop/get-by-city/${targetCity}`,
          { withCredentials: true, signal: controller.signal },
        );

        if (!isActive) return;
        const shops = Array.isArray(result.data) ? result.data : [];
        dispatch(setShopsInMyCity(shops));

        // If geolocation auto-set a city that has no data, fallback once.
        if (shops.length === 0 && targetCity !== "mathura") {
          let isAuto = false;
          try {
            isAuto = sessionStorage.getItem("vingo_city_auto") === "1";
          } catch {
            isAuto = false;
          }

          if (isAuto && !didFallback) {
            didFallback = true;
            try {
              sessionStorage.removeItem("vingo_city_auto");
            } catch {
              // ignore
            }
            dispatch(setCurrentCity("mathura"));
            return;
          }
        }
        if (import.meta.env.DEV) {
          console.log(`Fetched shops for ${targetCity}:`, shops);
        }
      } catch (error) {
        if (error?.name === "CanceledError") return;
        if (!isActive) return;
        console.error(`Error fetching shops for ${targetCity}:`, error);
        dispatch(setShopsInMyCity([]));
      }
    };

    const t = setTimeout(fetchShops, debounceMs);
    return () => {
      isActive = false;
      clearTimeout(t);
      controller.abort();
    };
  }, [currentCity, dispatch]);
}

export default useGetShopByCity;
