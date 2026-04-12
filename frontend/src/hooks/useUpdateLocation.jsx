import axios from "axios";
import React, { useEffect, useRef } from "react";
import { serverUrl } from "../config";
import { useSelector } from "react-redux";

function useUpdateLocation() {
  const { userData } = useSelector((state) => state.user);
  const disabledRef = useRef(false);
  const userId = userData?._id;

  useEffect(() => {
    if (!userId) return;
    if (!navigator.geolocation) return;

    disabledRef.current = false;

    const updateLocation = async (lat, lon) => {
      if (disabledRef.current) return;
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

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        updateLocation(pos.coords.latitude, pos.coords.longitude);
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 30_000, timeout: 10_000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [userId]);
}

export default useUpdateLocation;
