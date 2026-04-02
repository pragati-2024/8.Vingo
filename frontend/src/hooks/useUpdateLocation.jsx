import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentAddress,
  setCurrentCity,
  setCurrentState,
  setUserData,
} from "../redux/userSlice";
import { setAddress, setLocation } from "../redux/mapSlice";

function useUpdateLocation() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (!userData) {
      return;
    }

    let watchId;

    const updateLocation = async (lat, lon) => {
      const result = await axios.post(
        `${serverUrl}/api/user/update-location`,
        { lat, lon },
        { withCredentials: true },
      );
      console.log(result.data);
    };

    const run = async () => {
      try {
        if (!navigator?.geolocation) return;

        // Avoid prompting without a user gesture.
        if (navigator?.permissions?.query) {
          const permission = await navigator.permissions.query({
            name: "geolocation",
          });
          if (permission.state !== "granted") {
            return;
          }
        }

        watchId = navigator.geolocation.watchPosition((pos) => {
          updateLocation(pos.coords.latitude, pos.coords.longitude);
        });
      } catch (e) {
        // Ignore
      }
    };

    run();
    return () => {
      if (watchId != null && navigator?.geolocation?.clearWatch) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [userData]);
}

export default useUpdateLocation;
