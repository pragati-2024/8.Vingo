import React, { Suspense, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";

import useGetCurrentUser from "./hooks/useGetCurrentUser";
import useGetCity from "./hooks/useGetCity";
import useGetMyshop from "./hooks/useGetMyShop";
import useGetShopByCity from "./hooks/useGetShopByCity";
import useGetItemsByCity from "./hooks/useGetItemsByCity";
import useGetMyOrders from "./hooks/useGetMyOrders";

import { setSocket, setUserOnline } from "./redux/userSlice";
import Layout from "./components/Layout";
import { serverUrl } from "./config";

const SignUp = React.lazy(() => import("./pages/SignUp"));
const SignIn = React.lazy(() => import("./pages/SignIn"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const Home = React.lazy(() => import("./pages/Home"));
const CreateEditShop = React.lazy(() => import("./pages/CreateEditShop"));
const AddItem = React.lazy(() => import("./pages/AddItem"));
const EditItem = React.lazy(() => import("./pages/EditItem"));
const CartPage = React.lazy(() => import("./pages/CartPage"));
const CheckOut = React.lazy(() => import("./pages/CheckOut"));
const OrderPlaced = React.lazy(() => import("./pages/OrderPlaced"));
const AboutUs = React.lazy(() => import("./pages/AboutUs"));
const MyOrders = React.lazy(() => import("./pages/MyOrders"));
const TrackOrderPage = React.lazy(() => import("./pages/TrackOrderPage"));
const Shop = React.lazy(() => import("./pages/Shop"));
const ContactUs = React.lazy(() => import("./pages/ContactUs"));
const PublicLanding = React.lazy(() => import("./pages/PublicLanding"));

function App() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const isAuthed = Boolean(userData);
  const authReady = userData !== undefined;
  const enableUserCityFeatures = userData?.role === "user";
  const userId = userData?._id;

  useGetCurrentUser();
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
      <Suspense fallback={null}>
        <Routes>
          <Route
            path="/signup"
            element={
              authReady ? !userData ? <SignUp /> : <Navigate to="/" /> : null
            }
          />
          <Route
            path="/signin"
            element={
              authReady ? !userData ? <SignIn /> : <Navigate to="/" /> : null
            }
          />
          <Route
            path="/forgot-password"
            element={!userData ? <ForgotPassword /> : <Navigate to="/" />}
          />

          <Route
            path="/"
            element={authReady ? isAuthed ? <Home /> : <PublicLanding /> : null}
          />
          <Route
            path="/create-edit-shop"
            element={
              authReady ? (
                isAuthed ? (
                  <CreateEditShop />
                ) : (
                  <Navigate to="/signin" replace />
                )
              ) : null
            }
          />
          <Route
            path="/add-shop"
            element={
              authReady ? (
                isAuthed ? (
                  <CreateEditShop />
                ) : (
                  <Navigate to="/signin" replace />
                )
              ) : null
            }
          />
          <Route
            path="/add-item"
            element={
              authReady ? (
                isAuthed ? (
                  <AddItem />
                ) : (
                  <Navigate to="/signin" replace />
                )
              ) : null
            }
          />
          <Route
            path="/edit-item/:itemId"
            element={
              authReady ? (
                isAuthed ? (
                  <EditItem />
                ) : (
                  <Navigate to="/signin" replace />
                )
              ) : null
            }
          />
          <Route
            path="/cart"
            element={
              authReady ? (
                isAuthed ? (
                  <CartPage />
                ) : (
                  <Navigate to="/signin" replace />
                )
              ) : null
            }
          />
          <Route
            path="/checkout"
            element={
              authReady ? (
                isAuthed ? (
                  <CheckOut />
                ) : (
                  <Navigate to="/signin" replace />
                )
              ) : null
            }
          />
          <Route
            path="/order-placed"
            element={
              authReady ? (
                isAuthed ? (
                  <OrderPlaced />
                ) : (
                  <Navigate to="/signin" replace />
                )
              ) : null
            }
          />
          <Route path="/about" element={<AboutUs />} />
          <Route
            path="/my-orders"
            element={
              authReady ? (
                isAuthed ? (
                  <MyOrders />
                ) : (
                  <Navigate to="/signin" replace />
                )
              ) : null
            }
          />
          <Route
            path="/track-order/:orderId"
            element={
              authReady ? (
                isAuthed ? (
                  <TrackOrderPage />
                ) : (
                  <Navigate to="/signin" replace />
                )
              ) : null
            }
          />
          <Route
            path="/shop/:shopId"
            element={
              authReady ? (
                isAuthed ? (
                  <Shop />
                ) : (
                  <Navigate to="/signin" replace />
                )
              ) : null
            }
          />
          <Route path="/contact" element={<ContactUs />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
