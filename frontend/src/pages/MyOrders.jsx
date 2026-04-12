import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";
import {
  addMyOrder,
  setMyOrders,
  updateRealtimeOrderStatus,
} from "../redux/userSlice";

function MyOrders() {
  const { userData, myOrders, socket, loadingOrders } = useSelector(
    (state) => state.user,
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const filteredOrders = useMemo(() => {
    const orders = Array.isArray(myOrders) ? myOrders : [];
    if (userData?.role !== "owner") return orders;
    // Owner receives flattened orders { _id, shopOrder }. Hide completed ones from active list.
    return orders.filter((o) => {
      const status = String(o?.shopOrder?.status || "").trim().toLowerCase();
      return status !== "delivered";
    });
  }, [myOrders, userData?.role]);

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (data) => {
      const role = userData?.role;
      const me = userData?._id?.toString?.();
      if (!me) return;

      // Owner receives flattened payload: { _id, user, shopOrder }
      if (role === "owner") {
        const ownerId =
          data?.shopOrder?.owner?._id?.toString?.() ||
          data?.shopOrder?.owner?.toString?.();
        if (ownerId && ownerId === me) {
          dispatch(addMyOrder(data));
        }
        return;
      }

      // User should only ever add their own order (usually via API response),
      // but if a socket payload arrives, validate it's for the current user.
      if (role === "user") {
        const userId =
          data?.user?._id?.toString?.() || data?.user?.toString?.();
        if (userId && userId === me) {
          dispatch(addMyOrder(data));
        }
        return;
      }

      // DeliveryBoy should not mutate My Orders list.
    };

    socket.on("newOrder", handleNewOrder);

    socket.on("update-status", ({ orderId, shopId, status, deliveryBoy }) => {
      // Both user and owner UIs rely on this to live-update statuses.
      dispatch(
        updateRealtimeOrderStatus({ orderId, shopId, status, deliveryBoy }),
      );
    });

    socket.on("orderAccepted", ({ orderId, shopId, deliveryBoy }) => {
      if (userData?.role === "owner") {
        dispatch(
          updateRealtimeOrderStatus({
            orderId,
            shopId,
            status: "accepted",
            deliveryBoy,
          }),
        );
      }
    });

    return () => {
      socket.off("newOrder", handleNewOrder);
      socket.off("update-status");
      socket.off("orderAccepted");
    };
  }, [socket, userData?._id, userData?.role, dispatch]);

  if (loadingOrders) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#fffcf8]">
        <div className="w-12 h-12 border-4 border-[#ff4d2d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#fffcf8] flex justify-center px-4">
      <div className="w-full max-w-200 p-4 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl my-10 border border-gray-100/50 subtle-star-pattern">
        <div className="p-6">
          <div className="flex items-center gap-5 mb-8">
            <div
              className="z-10 cursor-pointer hover:scale-110 transition-transform"
              onClick={() => navigate("/")}
            >
              <IoIosArrowRoundBack size={40} className="text-[#ff4d2d]" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">
              My Orders
            </h1>
          </div>
          <div className="space-y-6">
            {filteredOrders.length === 0 && (
              <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs italic">
                  No orders found yet 😔
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-4 text-[#ff4d2d] font-black uppercase text-[10px] tracking-[0.2em] border-b border-[#ff4d2d] pb-0.5"
                >
                  {userData?.role === "owner"
                    ? "Wait for customers"
                    : "Start Ordering Now"}
                </button>
              </div>
            )}
            {filteredOrders.map((order, index) =>
              userData?.role == "user" ? (
                <UserOrderCard data={order} key={order._id || index} />
              ) : userData?.role == "owner" ? (
                <OwnerOrderCard data={order} key={order._id || index} />
              ) : userData?.role == "deliveryBoy" ? (
                <UserOrderCard data={order} key={order._id || index} />
              ) : null,
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyOrders;
