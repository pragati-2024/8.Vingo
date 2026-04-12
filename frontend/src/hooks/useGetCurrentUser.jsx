import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../config";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

function useGetCurrentUser() {
  const dispatch = useDispatch();
  useEffect(() => {
    let isActive = true;
    let settled = false;

    // If the backend is asleep / unreachable, don't keep UI stuck in `undefined`.
    // We pessimistically show logged-out UI after a short delay, but still allow
    // a later successful response to override it.
    const fallbackMs = 3500;
    const fallbackTimer = setTimeout(() => {
      if (!isActive || settled) return;
      dispatch(setUserData(null));
    }, fallbackMs);

    const fetchUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/user/current`, {
          withCredentials: true,
        });
        if (!isActive) return;
        settled = true;
        dispatch(setUserData(result.data));
      } catch (error) {
        if (!isActive) return;
        settled = true;

        // 401 => definitely logged out.
        if (error?.response?.status === 401) {
          dispatch(setUserData(null));
          return;
        }

        // Any other error (network, CORS, misconfigured URL) => treat as logged out
        // so we can at least render sign-in/up instead of a blank screen.
        dispatch(setUserData(null));
      } finally {
        clearTimeout(fallbackTimer);
      }
    };

    fetchUser();

    return () => {
      isActive = false;
      clearTimeout(fallbackTimer);
    };
  }, [dispatch]);
}

export default useGetCurrentUser;
