import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../config";
import { useDispatch, useSelector } from "react-redux";
import { setMyOrders, setUserData, setLoadingOrders } from "../redux/userSlice";

function useGetMyOrders() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const userId = userData?._id;
  const role = userData?.role;
  useEffect(() => {
    if (!userId) {
      dispatch(setMyOrders([]));
      return;
    }
    const fetchOrders = async () => {
      try {
        dispatch(setLoadingOrders(true));
        const result = await axios.get(`${serverUrl}/api/order/my-orders`, {
          withCredentials: true,
        });
        dispatch(setMyOrders(result.data));
      } catch (error) {
        if (error?.response?.status === 401) {
          dispatch(setUserData(null));
          dispatch(setMyOrders([]));
          return;
        }
        console.log(error);
      } finally {
        dispatch(setLoadingOrders(false));
      }
    };
    fetchOrders();
  }, [userId, role, dispatch]);
}

export default useGetMyOrders;
