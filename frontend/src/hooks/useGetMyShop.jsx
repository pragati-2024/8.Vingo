import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../config";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { setMyShops } from "../redux/ownerSlice";

function useGetMyshop() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const userId = userData?._id;
  const role = userData?.role;
  useEffect(() => {
    if (role === "owner" && userId) {
      const fetchShop = async () => {
        try {
          const result = await axios.get(`${serverUrl}/api/shop/get-my`, {
            withCredentials: true,
          });
          dispatch(setMyShops(result.data));
        } catch (error) {
          if (error?.response?.status === 401) {
            dispatch(setUserData(null));
            dispatch(setMyShops([]));
            return;
          }
          console.log(error);
        }
      };
      fetchShop();
    }
  }, [userId, role, dispatch]);
}

export default useGetMyshop;
