import axios from "axios";
import React, { useEffect, useRef } from "react";
import { serverUrl } from "../config";
import { useSelector } from "react-redux";

function useUpdateLocation() {
  const { userData } = useSelector((state) => state.user);
  const disabledRef = useRef(false);
  const lastSentAtRef = useRef(0);
  const userId = userData?._id;
  const role = userData?.role;

  useEffect(() => {
    if (!userId) return;
    if (!navigator.geolocation) return;

    // Only delivery boys need continuous background location updates.
    // For normal users/owners this causes unnecessary prompts and “blocked” errors.
    if (role !== "deliveryBoy") return;

    disabledRef.current = false;
    lastSentAtRef.current = 0;

    const minIntervalMs = 20_000;

    const updateLocation = async (lat, lon) => {
      if (disabledRef.current) return;
      const now = Date.now();
      if (now - lastSentAtRef.current < minIntervalMs) return;
      lastSentAtRef.current = now;
      try {
        await axios.post(
          `${serverUrl}/api/user/update-location`,
          { lat, lon },
          { withCredentials: true },
        );
      } catch (e) {
        if (e?.response?.status === 401) {
          disabledRef.current = true;
        }
      }
    };

    let watchId = null;
    let isActive = true;

    const startWatch = () => {
      if (!isActive) return;
      if (watchId != null) return;
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          updateLocation(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Permission denied/blocked or unavailable.
          disabledRef.current = true;
        },
        { enableHighAccuracy: false, maximumAge: 30_000, timeout: 10_000 },
      );
    };

    // Avoid auto-triggering permission prompts on page load.
    const permissions = navigator.permissions;
    if (permissions?.query) {
      permissions
        .query({ name: "geolocation" })
        .then((status) => {
          if (!isActive) return;
          if (status.state === "granted") {
            startWatch();
            return;
          }
          if (status.state === "denied") {
            disabledRef.current = true;
            return;
          }

          // state === 'prompt' → wait for a user gesture
          const onGesture = () => {
            window.removeEventListener("pointerdown", onGesture);
            startWatch();
          };
          window.addEventListener("pointerdown", onGesture, { once: true });
        })
        .catch(() => {
          // Older browsers: fall back to starting immediately.
          startWatch();
        });
    } else {
      startWatch();
    }

    return () => {
      isActive = false;
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
    };
  }, [userId, role]);
}

export default useUpdateLocation;
