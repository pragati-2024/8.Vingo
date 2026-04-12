import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";

import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import CreateEditShop from "./pages/CreateEditShop";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import CartPage from "./pages/CartPage";
import CheckOut from "./pages/CheckOut";
import OrderPlaced from "./pages/OrderPlaced";
import AboutUs from "./pages/AboutUs";
import MyOrders from "./pages/MyOrders";
import TrackOrderPage from "./pages/TrackOrderPage";
import Shop from "./pages/Shop";
import ContactUs from "./pages/ContactUs";

import useGetCurrentUser from "./hooks/useGetCurrentUser";
import useGetCity from "./hooks/useGetCity";
import useGetMyshop from "./hooks/useGetMyShop";
import useGetShopByCity from "./hooks/useGetShopByCity";
import useGetItemsByCity from "./hooks/useGetItemsByCity";
import useGetMyOrders from "./hooks/useGetMyOrders";
import useUpdateLocation from "./hooks/useUpdateLocation";

import { setSocket, setUserOnline } from "./redux/userSlice";
import Layout from "./components/Layout";
import { serverUrl } from "./config";

function App() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const userId = userData?._id;

  useGetCurrentUser();
  useUpdateLocation();
  useGetCity();
  useGetMyshop();
  useGetShopByCity();
  useGetItemsByCity();
  useGetMyOrders();

  useEffect(() => {
    if (!userId) return;

    const socketInstance = io(serverUrl, { withCredentials: true });
    dispatch(setSocket(socketInstance));

    socketInstance.on("connect", () => {
      socketInstance.emit("identity", { userId });
      dispatch(setUserOnline(true));
    });

    socketInstance.on("disconnect", () => {
      dispatch(setUserOnline(false));
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [dispatch, userId]);

  return (
    <Layout>
      <Routes>
        <Route
          path="/signup"
          element={!userData ? <SignUp /> : <Navigate to="/" />}
        />
        <Route
          path="/signin"
          element={!userData ? <SignIn /> : <Navigate to="/" />}
        />
        <Route
          path="/forgot-password"
          element={!userData ? <ForgotPassword /> : <Navigate to="/" />}
        />

        <Route
          path="/"
          element={
            userData === undefined ? null : userData ? <Home /> : <Navigate to="/signin" />
          }
        />
        <Route
          path="/create-edit-shop"
          element={
            userData === undefined ? null : userData ? <CreateEditShop /> : <Navigate to="/signin" />
          }
        />
        <Route
          path="/add-shop"
          element={
            userData === undefined ? null : userData ? <CreateEditShop /> : <Navigate to="/signin" />
          }
        />
        <Route
          path="/add-item"
          element={
            userData === undefined ? null : userData ? <AddItem /> : <Navigate to="/signin" />
          }
        />
        <Route
          path="/edit-item/:itemId"
          element={
            userData === undefined ? null : userData ? <EditItem /> : <Navigate to="/signin" />
          }
        />
        <Route
          path="/cart"
          element={
            userData === undefined ? null : userData ? <CartPage /> : <Navigate to="/signin" />
          }
        />
        <Route
          path="/checkout"
          element={
            userData === undefined ? null : userData ? <CheckOut /> : <Navigate to="/signin" />
          }
        />
        <Route
          path="/order-placed"
          element={
            userData === undefined ? null : userData ? <OrderPlaced /> : <Navigate to="/signin" />
          }
        />
        <Route path="/about" element={<AboutUs />} />
        <Route
          path="/my-orders"
          element={
            userData === undefined ? null : userData ? <MyOrders /> : <Navigate to="/signin" />
          }
        />
        <Route
          path="/track-order/:orderId"
          element={
            userData === undefined ? null : userData ? <TrackOrderPage /> : <Navigate to="/signin" />
          }
        />
        <Route
          path="/shop/:shopId"
          element={
            userData === undefined ? null : userData ? <Shop /> : <Navigate to="/signin" />
          }
        />
        <Route path="/contact" element={<ContactUs />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default App;
