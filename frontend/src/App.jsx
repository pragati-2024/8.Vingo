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
import PublicLanding from "./pages/PublicLanding";

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

  const isAuthed = Boolean(userData);
  const enableUserCityFeatures = userData?.role === "user";

  const userId = userData?._id;

  useGetCurrentUser();
  useUpdateLocation();
  useGetCity(enableUserCityFeatures);
  useGetMyshop();
  useGetShopByCity(enableUserCityFeatures);
  useGetItemsByCity(enableUserCityFeatures);
  useGetMyOrders();

  useEffect(() => {
    if (!userId) return;

    let token = null;
    try {
      token = localStorage.getItem("vingo_token");
    } catch {
      // ignore
    }

    const socketInstance = io(serverUrl, {
      withCredentials: true,
      auth: token ? { token } : undefined,
    });
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

        <Route path="/" element={isAuthed ? <Home /> : <PublicLanding />} />
        <Route
          path="/create-edit-shop"
          element={
            isAuthed ? <CreateEditShop /> : <Navigate to="/signin" replace />
          }
        />
        <Route
          path="/add-shop"
          element={
            isAuthed ? <CreateEditShop /> : <Navigate to="/signin" replace />
          }
        />
        <Route
          path="/add-item"
          element={isAuthed ? <AddItem /> : <Navigate to="/signin" replace />}
        />
        <Route
          path="/edit-item/:itemId"
          element={isAuthed ? <EditItem /> : <Navigate to="/signin" replace />}
        />
        <Route
          path="/cart"
          element={isAuthed ? <CartPage /> : <Navigate to="/signin" replace />}
        />
        <Route
          path="/checkout"
          element={isAuthed ? <CheckOut /> : <Navigate to="/signin" replace />}
        />
        <Route
          path="/order-placed"
          element={
            isAuthed ? <OrderPlaced /> : <Navigate to="/signin" replace />
          }
        />
        <Route path="/about" element={<AboutUs />} />
        <Route
          path="/my-orders"
          element={isAuthed ? <MyOrders /> : <Navigate to="/signin" replace />}
        />
        <Route
          path="/track-order/:orderId"
          element={
            isAuthed ? <TrackOrderPage /> : <Navigate to="/signin" replace />
          }
        />
        <Route
          path="/shop/:shopId"
          element={isAuthed ? <Shop /> : <Navigate to="/signin" replace />}
        />
        <Route path="/contact" element={<ContactUs />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default App;
