import axios from "axios";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentAddress,
  setCurrentCity,
  setCurrentState,
} from "../redux/userSlice";
import { setAddress, setLocation } from "../redux/mapSlice";

function useGetCity() {
  const dispatch = useDispatch();
  const { currentCity } = useSelector((state) => state.user);
  const apiKey = import.meta.env.VITE_GEOAPIKEY;
  const lastResolvedCityRef = useRef(null);
  const currentCityRef = useRef(currentCity);
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    currentCityRef.current = currentCity;
  }, [currentCity]);

  useEffect(() => {
    if (!apiKey) return;
    if (!navigator.geolocation) return;

    // Only request geolocation once per session to avoid re-fetch loops.
    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;

    let isActive = true;

    const resolveFromPosition = async (position) => {
      if (!isActive) return;
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      dispatch(setLocation({ lat: latitude, lon: longitude }));

      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`,
        { withCredentials: false },
      );

      const resolvedCity =
        result?.data?.results?.[0]?.city || result?.data?.results?.[0]?.county;

      const normalizedResolved = (resolvedCity || "").trim().toLowerCase();
      const normalizedCurrent = (currentCityRef.current || "")
        .trim()
        .toLowerCase();

      // Only auto-set city if the user hasn't already set one.
      if (!normalizedCurrent) {
        if (
          normalizedResolved &&
          normalizedResolved !== lastResolvedCityRef.current
        ) {
          lastResolvedCityRef.current = normalizedResolved;
          dispatch(setCurrentCity(resolvedCity));
          try {
            sessionStorage.setItem("vingo_city_auto", "1");
          } catch {
            // ignore
          }
        }
      }

      dispatch(setCurrentState(result?.data?.results?.[0]?.state));
      dispatch(
        setCurrentAddress(
          result?.data?.results?.[0]?.address_line2 ||
            result?.data?.results?.[0]?.address_line1,
        ),
      );
      dispatch(setAddress(result?.data?.results?.[0]?.address_line2));
    };

    const onError = (err) => {
      // Silently ignore geolocation errors in UI; app still works with manual city input.
      console.warn("Geolocation failed:", err?.message || err);
    };

    const requestLocation = () => {
      navigator.geolocation.getCurrentPosition(resolveFromPosition, onError, {
        enableHighAccuracy: false,
        maximumAge: 5 * 60 * 1000,
        timeout: 10 * 1000,
      });
    };

    // If permissions API exists, avoid auto-triggering the prompt.
    const permissions = navigator.permissions;
    if (permissions?.query) {
      permissions
        .query({ name: "geolocation" })
        .then((status) => {
          if (!isActive) return;
          if (status.state === "granted") {
            requestLocation();
            return;
          }
          if (status.state === "denied") return;

          // state === 'prompt' → wait for the next user gesture
          const onGesture = () => {
            window.removeEventListener("pointerdown", onGesture);
            requestLocation();
          };
          window.addEventListener("pointerdown", onGesture, { once: true });
        })
        .catch(() => {
          // Fallback: request immediately (older browsers)
          requestLocation();
        });
    } else {
      // Fallback: request immediately (older browsers)
      requestLocation();
    }

    return () => {
      isActive = false;
    };
  }, [apiKey, dispatch]);
}

export default useGetCity;
