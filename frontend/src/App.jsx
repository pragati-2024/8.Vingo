import React, { Suspense, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

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

    // Lazy-load socket.io so unauthenticated users get a faster initial bundle.
    let socketInstance = null;
    let cancelled = false;

    (async () => {
      try {
        const mod = await import("socket.io-client");
        if (cancelled) return;

        const socket = mod.io(serverUrl, {
          withCredentials: true,
          auth: token ? { token } : undefined,
        });

        socketInstance = socket;
        dispatch(setSocket(socket));

        socket.on("connect", () => {
          socket.emit("identity", { userId });
          dispatch(setUserOnline(true));
        });

        socket.on("disconnect", () => {
          dispatch(setUserOnline(false));
        });
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
      try {
        socketInstance?.disconnect();
      } catch {
        // ignore
      }
    };
  }, [dispatch, userId]);

  const splash = (
    <div className="w-full flex items-center justify-center px-4 pt-27.5 pb-10">
      <div className="w-full max-w-xl bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <h2 className="text-3xl md:text-4xl font-black text-white">
          Welcome to <span className="text-[#ff4d2d]">Vingo</span>
        </h2>
        <p className="mt-3 text-white/80 font-semibold">
          Loading your experience…
        </p>
        <div className="mt-6 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      </div>
    </div>
  );

  if (!authReady) {
    return <Layout>{splash}</Layout>;
  }

  return (
    <Layout>
      <Suspense fallback={splash}>
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
