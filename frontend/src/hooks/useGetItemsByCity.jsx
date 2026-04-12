import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../config";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentCity, setItemsInMyCity } from "../redux/userSlice";

function useGetItemsByCity(enabled = true) {
  const dispatch = useDispatch();
  const { currentCity } = useSelector((state) => state.user);

  useEffect(() => {
    if (!enabled) return;
    // Fallback to "mathura" if city is empty
    const targetCity = (currentCity || "").trim().toLowerCase() || "mathura";
    let isActive = true;
    const controller = new AbortController();
    const debounceMs = 350;

    let didFallback = false;

    const fetchItems = async () => {
      // Mark loading in store for screens that need a spinner
      dispatch(setItemsInMyCity(null));
      try {
        const result = await axios.get(
          `${serverUrl}/api/item/get-by-city/${targetCity}`,
          { withCredentials: true, signal: controller.signal },
        );
        if (!isActive) return;
        const items = Array.isArray(result.data) ? result.data : [];
        dispatch(setItemsInMyCity(items));

        // If geolocation auto-set a city that has no data, fallback once.
        if (items.length === 0 && targetCity !== "mathura") {
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
          console.log(`Fetched items for ${targetCity}:`, items);
        }
      } catch (error) {
        if (error?.name === "CanceledError") return;
        if (!isActive) return;
        console.error(`Error fetching items for ${targetCity}:`, error);
        dispatch(setItemsInMyCity([]));
      }
    };

    const t = setTimeout(fetchItems, debounceMs);
    return () => {
      isActive = false;
      clearTimeout(t);
      controller.abort();
    };
  }, [enabled, currentCity, dispatch]);
}

export default useGetItemsByCity;
