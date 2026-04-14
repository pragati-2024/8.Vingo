import axios from "axios";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentAddress,
  setCurrentCity,
  setCurrentState,
} from "../redux/userSlice";
import { setAddress, setLocation } from "../redux/mapSlice";

function useGetCity(enabled = true) {
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
    if (!enabled) return;
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

      // Some devices/browsers can return a useless default like (0,0), which reverse-geocodes to "Earth".
      const hasValidCoords =
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        !(latitude === 0 && longitude === 0);
      if (!hasValidCoords) return;

      dispatch(setLocation({ lat: latitude, lon: longitude }));

      let result;
      try {
        result = await axios.get(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`,
          { withCredentials: false },
        );
      } catch (e) {
        console.warn("Reverse geocode failed:", e?.message || e);
        return;
      }

      const resolvedCityRaw =
        result?.data?.results?.[0]?.city || result?.data?.results?.[0]?.county;

      // If geo provider returns Earth/Unknown-ish values, ignore.
      const normalizedResolved = (resolvedCityRaw || "").trim().toLowerCase();
      if (!normalizedResolved || normalizedResolved === "earth") return;
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
          dispatch(setCurrentCity(resolvedCityRaw));
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

    // If permissions API exists, never auto-trigger the prompt.
    // Only run if permission is already granted.
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

          // state === 'prompt' → wait for a user gesture, then request.
          const onGesture = () => {
            window.removeEventListener("pointerdown", onGesture);
            requestLocation();
          };
          window.addEventListener("pointerdown", onGesture, { once: true });
        })
        .catch(() => {
          // Fallback: wait for a user gesture, then request.
          const onGesture = () => {
            window.removeEventListener("pointerdown", onGesture);
            requestLocation();
          };
          window.addEventListener("pointerdown", onGesture, { once: true });
        });
    } else {
      // Older browsers: avoid auto-prompt; request only after a user gesture.
      const onGesture = () => {
        window.removeEventListener("pointerdown", onGesture);
        requestLocation();
      };
      window.addEventListener("pointerdown", onGesture, { once: true });
    }

    return () => {
      isActive = false;
    };
  }, [enabled, apiKey, dispatch]);
}

export default useGetCity;
