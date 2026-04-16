import React, { useCallback, useMemo, useState, useEffect } from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../config";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import { ClipLoader } from "react-spinners";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMotorcycle,
  FaMapMarkerAlt,
  FaUser,
  FaPhoneAlt,
  FaCheckCircle,
  FaChartLine,
  FaHistory,
  FaUtensils,
} from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";

function DeliveryBoy() {
  const { userData, socket } = useSelector((state) => state.user);
  // Some eslint setups don't count `motion.div` as a variable usage.
  const _motion = motion;
  const [currentOrder, setCurrentOrder] = useState(null);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [_loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [showAllGigs, setShowAllGigs] = useState(false);
  const [liveLocation, setLiveLocation] = useState(() => {
    const coords = userData?.location?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return null;
    const lon = Number(coords[0]);
    const lat = Number(coords[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    if (lat === 0 && lon === 0) return null;
    return [lon, lat];
  });

  const otherAssignedOrders = useMemo(() => {
    const list = Array.isArray(assignedOrders) ? assignedOrders : [];
    const currentId = currentOrder?._id?.toString?.();
    return currentId
      ? list.filter((o) => (o?._id?.toString?.() ?? "") !== currentId)
      : list;
  }, [assignedOrders, currentOrder?._id]);

  const gigsToShow = useMemo(() => {
    const list = Array.isArray(availableOrders) ? availableOrders : [];
    return showAllGigs ? list : list.slice(0, 4);
  }, [availableOrders, showAllGigs]);

  const activeShopOrder = useMemo(() => {
    if (!currentOrder || !Array.isArray(currentOrder.shopOrders)) return null;
    const me = userData?._id?.toString?.();
    if (!me) return currentOrder.shopOrders[0] || null;
    return (
      currentOrder.shopOrders.find((so) => {
        const assigned =
          so?.assignedDeliveryBoy?._id?.toString?.() ||
          so?.assignedDeliveryBoy?.toString?.();
        return assigned === me;
      }) ||
      currentOrder.shopOrders[0] ||
      null
    );
  }, [currentOrder, userData?._id]);

  const manifestItems = useMemo(() => {
    if (!currentOrder || !Array.isArray(currentOrder.shopOrders)) return [];
    const map = new Map();
    for (const so of currentOrder.shopOrders) {
      const items = Array.isArray(so?.shopOrderItems) ? so.shopOrderItems : [];
      for (const item of items) {
        const itemId =
          item?.item?._id?.toString?.() ?? item?.item?.toString?.() ?? "";
        const name = String(item?.name || "").trim();
        const price = Number(item?.price);
        const quantity = Number(item?.quantity || 0);
        const key = itemId || `${name}:${price}`;
        if (!key) continue;
        const prev = map.get(key);
        if (prev) {
          prev.quantity += Number.isFinite(quantity) ? quantity : 0;
        } else {
          map.set(key, {
            key,
            name,
            price: Number.isFinite(price) ? price : 0,
            quantity: Number.isFinite(quantity) ? quantity : 0,
          });
        }
      }
    }
    return Array.from(map.values()).filter((x) => x.name);
  }, [currentOrder]);

  const getDeliveryLogTitle = useCallback((order) => {
    const shopOrders = Array.isArray(order?.shopOrders) ? order.shopOrders : [];
    const names = [];

    for (const so of shopOrders) {
      const items = Array.isArray(so?.shopOrderItems) ? so.shopOrderItems : [];
      for (const item of items) {
        const name = String(item?.name || "").trim();
        if (name) names.push(name);
      }
    }

    const uniqueNames = Array.from(new Set(names));
    if (uniqueNames.length === 0) {
      return "ORDER";
    }

    if (uniqueNames.length === 1) return uniqueNames[0];
    return `${uniqueNames[0]} +${uniqueNames.length - 1} more`;
  }, []);

  const dedupeByOrderId = useCallback((list) => {
    const arr = Array.isArray(list) ? list : [];
    const seen = new Set();
    const out = [];
    for (const item of arr) {
      const id = item?._id?.toString?.() ?? String(item?._id ?? "");
      if (!id) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(item);
    }
    return out;
  }, []);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    let sawAuthError = false;

    try {
      const ordersRes = await axios.get(`${serverUrl}/api/order/available`, {
        withCredentials: true,
      });
      setAvailableOrders(dedupeByOrderId(ordersRes.data));
    } catch (error) {
      console.error("Fetch available orders error:", error);
      if (error?.response?.status === 401) sawAuthError = true;
    }

    try {
      const assignedRes = await axios.get(
        `${serverUrl}/api/order/assigned/delivery`,
        { withCredentials: true },
      );
      const nextAssigned = dedupeByOrderId(assignedRes.data);
      setAssignedOrders(nextAssigned);

      // Choose the active mission: keep current if still present, else first.
      setCurrentOrder((prev) => {
        const prevId = prev?._id?.toString?.();
        if (prevId) {
          const stillThere = nextAssigned.find(
            (o) => o?._id?.toString?.() === prevId,
          );
          if (stillThere) return stillThere;
        }
        return nextAssigned[0] || null;
      });
    } catch (error) {
      console.error("Fetch assigned orders error:", error);
      if (error?.response?.status === 401) sawAuthError = true;
    }

    try {
      const deliveriesRes = await axios.get(
        `${serverUrl}/api/order/today-deliveries`,
        { withCredentials: true },
      );
      setTodayDeliveries(
        Array.isArray(deliveriesRes.data) ? deliveriesRes.data : [],
      );
    } catch (error) {
      console.error("Fetch today deliveries error:", error);
      if (error?.response?.status === 401) sawAuthError = true;
    }

    if (sawAuthError) {
      setMessage(
        "Not authorized. Make sure you are logged in as Delivery Boy (use a separate browser/profile from Owner/User).",
      );
      setTimeout(() => setMessage(""), 5000);
    }

    setLoading(false);
  }, [dedupeByOrderId]);

  useEffect(() => {
    if (userData?.role === "deliveryBoy") {
      const t = setTimeout(() => {
        fetchInitialData();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [userData, socket, fetchInitialData]);

  useEffect(() => {
    if (!socket || userData?.role !== "deliveryBoy") return;

    const handleNewOrder = (data) => {
      setAvailableOrders((prev) => {
        const incomingId = data?._id?.toString?.() ?? String(data?._id ?? "");
        const exists = prev.some(
          (a) => (a?._id?.toString?.() ?? String(a?._id ?? "")) === incomingId,
        );
        if (exists) return prev;
        return dedupeByOrderId([data, ...prev]);
      });
    };

    const handleOrderTaken = (orderId) => {
      const takenId = orderId?.toString?.() ?? String(orderId ?? "");
      setAvailableOrders((prev) =>
        prev.filter(
          (a) => (a?._id?.toString?.() ?? String(a?._id ?? "")) !== takenId,
        ),
      );
    };

    const handleAssignedOrder = (data) => {
      const hadActive = Boolean(currentOrder?._id);

      setAssignedOrders((prev) => {
        const next = Array.isArray(prev) ? prev : [];
        const incomingId = data?._id?.toString?.() ?? String(data?._id ?? "");
        const exists = next.some(
          (o) => (o?._id?.toString?.() ?? String(o?._id ?? "")) === incomingId,
        );
        return exists ? next : [data, ...next];
      });

      // If you're already working on a mission, don't forcibly switch.
      setCurrentOrder((prev) => prev || data);
      setShowOtpBox(false);
      setOtp("");
      setShowCompleted(false);
      setMessage(
        hadActive
          ? "New mission added to your queue!"
          : "You've been assigned an active mission!",
      );
      setTimeout(() => setMessage(""), 3000);
    };

    socket.on("newOrder", handleNewOrder);
    socket.on("orderTaken", handleOrderTaken);
    socket.on("assignedOrder", handleAssignedOrder);

    let watchId;
    const startWatch = () => {
      if (!navigator.geolocation) return;
      if (watchId) return;
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLiveLocation([longitude, latitude]);
          socket.emit("updateLocation", {
            latitude,
            longitude,
            userId: userData._id,
            orderId: currentOrder?._id,
          });
        },
        (error) => console.error(error),
        { enableHighAccuracy: true },
      );
    };

    const permissions = navigator.permissions;
    if (permissions?.query) {
      permissions
        .query({ name: "geolocation" })
        .then((status) => {
          if (status.state === "granted") {
            startWatch();
            return;
          }
          if (status.state === "denied") return;
          // prompt → wait for user gesture
          const onGesture = () => {
            window.removeEventListener("pointerdown", onGesture);
            startWatch();
          };
          window.addEventListener("pointerdown", onGesture, { once: true });
        })
        .catch(() => {
          // Fallback: try starting immediately
          startWatch();
        });
    } else {
      // Fallback: try starting immediately
      startWatch();
    }

    return () => {
      socket.off("newOrder", handleNewOrder);
      socket.off("orderTaken", handleOrderTaken);
      socket.off("assignedOrder", handleAssignedOrder);
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [socket, userData, currentOrder, dedupeByOrderId]);

  const handleAccept = async (orderId) => {
    try {
      const hadActive = Boolean(currentOrder?._id);

      const res = await axios.post(
        `${serverUrl}/api/order/accept`,
        { orderId },
        { withCredentials: true },
      );

      const acceptedOrder = res.data.order;

      // If you're already working on a mission, keep focus there and add this to the queue.
      if (!hadActive) {
        setCurrentOrder(acceptedOrder);
      }

      setAssignedOrders((prev) => {
        const next = Array.isArray(prev) ? prev : [];
        const incomingId =
          acceptedOrder?._id?.toString?.() ?? String(acceptedOrder?._id ?? "");
        const exists = next.some(
          (o) => (o?._id?.toString?.() ?? String(o?._id ?? "")) === incomingId,
        );
        return exists ? next : [acceptedOrder, ...next];
      });

      const acceptedId = orderId?.toString?.() ?? String(orderId ?? "");
      setAvailableOrders((prev) =>
        prev.filter(
          (a) => (a?._id?.toString?.() ?? String(a?._id ?? "")) !== acceptedId,
        ),
      );

      setMessage(
        hadActive
          ? "Added to your mission queue!"
          : "Order accepted successfully!",
      );
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Accept error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const updateStatus = async (status) => {
    try {
      const shopId = activeShopOrder?.shop?._id || activeShopOrder?.shop;
      if (!shopId) {
        setMessage("Missing shop info for this order");
        setTimeout(() => setMessage(""), 3000);
        return;
      }
      const res = await axios.put(
        `${serverUrl}/api/order/status/${currentOrder._id}/${shopId}`,
        { status },
        { withCredentials: true },
      );
      setCurrentOrder(res.data.order);
      setMessage(`Status updated to ${status}`);
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const sendOtp = async () => {
    try {
      const res = await axios.post(
        `${serverUrl}/api/order/send-otp`,
        { orderId: currentOrder._id },
        { withCredentials: true },
      );
      setShowOtpBox(true);
      if (res?.data?.devOtp) {
        setOtp(String(res.data.devOtp));
      }
      setMessage(res?.data?.message || "OTP sent to customer");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || "Error sending OTP";
      setMessage(msg);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const verifyOtp = async () => {
    try {
      const cleanedOtp = String(otp || "")
        .replace(/\D/g, "")
        .slice(0, 4);
      if (cleanedOtp.length !== 4) {
        setMessage("Enter 4-digit OTP");
        setTimeout(() => setMessage(""), 3000);
        return;
      }
      await axios.post(
        `${serverUrl}/api/order/verify-otp`,
        { orderId: currentOrder._id, otp: cleanedOtp },
        { withCredentials: true },
      );
      // Immediately remove from active mission after completion.
      setAssignedOrders((prev) =>
        Array.isArray(prev)
          ? prev.filter(
              (o) =>
                (o?._id?.toString?.() ?? String(o?._id ?? "")) !==
                (currentOrder?._id?.toString?.() ??
                  String(currentOrder?._id ?? "")),
            )
          : [],
      );
      setShowOtpBox(false);
      setOtp("");
      setMessage("Order delivered successfully!");
      setTimeout(() => setMessage(""), 3000);
      setShowCompleted(false);
      setCurrentOrder(null);
      fetchInitialData();
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || "OTP verification failed";
      setMessage(msg);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (userData?.role !== "deliveryBoy") return <div>Access Denied</div>;

  return (
    <div className="w-full min-h-screen bg-[#fffcf8] font-['Outfit'] pb-10">
      {/* 🏍️ HERO SECTION (DELIVERY PANEL) */}
      <div className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden mb-12">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <img
          src="/delivery_bg.png"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Delivery Background"
          loading="eager"
          decoding="async"
          fetchpriority="high"
        />
        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-[#ff4d2d] rounded-full flex items-center justify-center text-white mb-6 shadow-2xl shadow-[#ff4d2d]/40 border-4 border-white/20"
          >
            <FaMotorcycle size={40} />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-4"
          >
            DELIVERY <span className="text-[#ff4d2d]">PANEL</span>
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-white/80 font-black uppercase tracking-[0.3em] text-sm md:text-base max-w-2xl"
          >
            EARN WHILE YOU RIDE. TRACK ORDERS & MONITOR GROWTH.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 🛵 PARTNER INFO HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter">
                Vingo
              </h2>
              <span className="bg-[#ff4d2d]/10 text-[#ff4d2d] px-3 py-1 rounded-xl text-xs font-black uppercase tracking-widest">
                Partner
              </span>
            </div>
            <p className="text-gray-500 font-medium">
              Welcome back,{" "}
              <span className="text-gray-900 font-bold capitalize">
                {userData.fullName}!
              </span>
            </p>
          </div>

          <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 px-6">
            <div
              className={`w-3 h-3 rounded-full ${userData.isOnline ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}
            ></div>
            <span className="font-black text-gray-700 uppercase tracking-widest text-xs">
              {userData.isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 transform -translate-x-1/2 z-100 bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 border border-white/10"
            >
              <FaCheckCircle className="text-[#ff4d2d]" /> {message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 🚀 LEFT COLUMN: MAIN WORKFLOW */}
          <div className="lg:col-span-8 space-y-12">
            {/* 🎯 ACTIVE MISSION */}
            {currentOrder ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100"
              >
                <div className="p-8 border-b border-gray-100 bg-[#fffcf8] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-900 p-4 rounded-2xl text-white">
                      <FaMotorcycle className="text-2xl" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                      Active Mission
                    </h2>
                  </div>
                  {Array.isArray(assignedOrders) &&
                    assignedOrders.length > 1 && (
                      <select
                        className="mr-4 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-widest text-gray-700"
                        value={currentOrder?._id || ""}
                        onChange={(e) => {
                          const nextId = e.target.value;
                          const next = assignedOrders.find(
                            (o) => String(o?._id) === String(nextId),
                          );
                          setCurrentOrder(next || null);
                          setShowOtpBox(false);
                          setOtp("");
                          setShowCompleted(false);
                        }}
                      >
                        {assignedOrders.map((o, idx) => {
                          const status =
                            o?.shopOrders?.find((so) => {
                              const assigned =
                                so?.assignedDeliveryBoy?._id?.toString?.() ||
                                so?.assignedDeliveryBoy?.toString?.();
                              return assigned === userData?._id?.toString?.();
                            })?.status || o?.shopOrders?.[0]?.status;

                          const statusLabel =
                            status === "out of delivery"
                              ? "Out for Delivery"
                              : status === "accepted"
                                ? "Accepted"
                                : status === "delivered"
                                  ? "Delivered"
                                  : String(status || "In progress");

                          const missionLabel = `Mission ${idx + 1}`;

                          return (
                            <option key={o._id} value={o._id}>
                              {missionLabel} • {statusLabel}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  <div className="bg-[#ff4d2d]/10 text-[#ff4d2d] px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                    {showCompleted ||
                    currentOrder.shopOrders?.[0]?.status === "delivered"
                      ? "Completed"
                      : "In Progress"}
                  </div>
                </div>

                {Array.isArray(assignedOrders) && assignedOrders.length > 1 && (
                  <div className="px-8 pt-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      Mission queue
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {assignedOrders.map((o, idx) => {
                        const isActive =
                          String(o?._id) === String(currentOrder?._id);
                        const status =
                          o?.shopOrders?.find((so) => {
                            const assigned =
                              so?.assignedDeliveryBoy?._id?.toString?.() ||
                              so?.assignedDeliveryBoy?.toString?.();
                            return assigned === userData?._id?.toString?.();
                          })?.status || o?.shopOrders?.[0]?.status;

                        return (
                          <button
                            key={o._id}
                            type="button"
                            onClick={() => {
                              setCurrentOrder(o);
                              setShowOtpBox(false);
                              setOtp("");
                              setShowCompleted(false);
                            }}
                            className={`shrink-0 px-4 py-2 rounded-2xl border text-xs font-black uppercase tracking-widest transition ${
                              isActive
                                ? "bg-gray-900 text-white border-gray-900"
                                : "bg-white text-gray-700 border-gray-200 hover:border-[#ff4d2d]/50"
                            }`}
                            title={`Mission ${idx + 1}`}
                          >
                            Mission {idx + 1}{" "}
                            <span
                              className={
                                isActive ? "text-white/70" : "text-gray-400"
                              }
                            >
                              •{" "}
                              {status === "out of delivery"
                                ? "Out for Delivery"
                                : status === "accepted"
                                  ? "Accepted"
                                  : status === "delivered"
                                    ? "Delivered"
                                    : String(status || "In progress")}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-gray-400 font-semibold">
                      OTP issue? Switch missions and return later.
                    </p>
                  </div>
                )}

                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                        <div className="bg-white p-3 rounded-xl shadow-sm text-gray-400">
                          <FaUser />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                            Customer
                          </p>
                          <h3 className="text-xl font-black text-gray-900">
                            {currentOrder.user?.fullName}
                          </h3>
                          <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                            <FaPhoneAlt size={12} /> {currentOrder.user?.mobile}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                        <div className="bg-white p-3 rounded-xl shadow-sm text-[#ff4d2d]">
                          <FaMapMarkerAlt />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                            Destination
                          </p>
                          <p className="text-gray-900 font-bold leading-tight">
                            {currentOrder.deliveryAddress?.text}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4d2d]/20 rounded-full blur-3xl"></div>
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
                        Order Manifest
                      </h3>
                      <div className="space-y-4">
                        {manifestItems.map((item) => (
                          <div
                            key={item.key}
                            className="flex justify-between items-center bg-white/5 p-4 rounded-2xl"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-black text-[#ff4d2d]">
                                {item.quantity}x
                              </span>
                              <span className="font-bold text-sm text-white/90">
                                {item.name}
                              </span>
                            </div>
                            <span className="font-black">₹{item.price}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Earnings
                        </span>
                        <span className="text-3xl font-black text-[#ff4d2d]">
                          ₹{currentOrder.totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 h-100 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl relative">
                    <DeliveryBoyTracking
                      deliveryBoyLocation={liveLocation}
                      customerLocation={[
                        currentOrder.deliveryAddress?.longitude,
                        currentOrder.deliveryAddress?.latitude,
                      ]}
                    />
                  </div>

                  <div className="mt-10 flex flex-col sm:flex-row gap-4">
                    {!showCompleted &&
                      activeShopOrder?.status === "accepted" && (
                        <button
                          onClick={() => updateStatus("out of delivery")}
                          className="flex-1 bg-gray-900 text-white py-6 rounded-4xl font-black text-lg uppercase tracking-widest shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3"
                        >
                          <MdDeliveryDining className="text-3xl" /> Start
                          Delivery
                        </button>
                      )}
                    {!showCompleted &&
                      activeShopOrder?.status === "out of delivery" &&
                      !showOtpBox && (
                        <button
                          onClick={sendOtp}
                          className="flex-1 bg-[#ff4d2d] text-white py-6 rounded-4xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-[#ff4d2d]/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                        >
                          <FaCheckCircle className="text-3xl" /> Confirm Arrival
                        </button>
                      )}
                  </div>

                  {showOtpBox && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="mt-8 bg-[#fffcf8] p-8 rounded-[2.5rem] border-2 border-orange-100"
                    >
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 text-center">
                        Customer Verification Code
                      </label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <input
                          type="text"
                          value={otp}
                          inputMode="numeric"
                          onChange={(e) => {
                            const cleaned = String(e.target.value || "")
                              .replace(/\D/g, "")
                              .slice(0, 4);
                            setOtp(cleaned);
                          }}
                          placeholder="XXXX"
                          className="flex-1 bg-white border-4 border-gray-100 rounded-3xl px-8 py-5 text-center text-4xl font-black tracking-[0.5em] focus:outline-none focus:border-[#ff4d2d] transition-all"
                        />
                        <button
                          onClick={verifyOtp}
                          type="button"
                          disabled={
                            String(otp || "").replace(/\D/g, "").length !== 4
                          }
                          className="bg-gray-900 text-white px-12 rounded-3xl font-black uppercase tracking-widest hover:bg-black transition-all"
                        >
                          Verify
                        </button>
                        <button
                          onClick={sendOtp}
                          type="button"
                          className="bg-white border-2 border-gray-200 text-gray-800 px-10 rounded-3xl font-black uppercase tracking-widest hover:border-[#ff4d2d]/50 transition-all"
                        >
                          Resend OTP
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {(showOtpBox ||
                    activeShopOrder?.status === "out of delivery") && (
                    <>
                      {Array.isArray(otherAssignedOrders) &&
                        otherAssignedOrders.length > 0 && (
                          <div className="mt-10 bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100">
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                              Other active missions
                            </h3>
                            <p className="mt-1 text-gray-500 font-medium text-sm">
                              If this order is stuck (OTP/customer), start
                              another and come back.
                            </p>

                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {otherAssignedOrders.slice(0, 4).map((o) => (
                                <button
                                  key={o._id}
                                  type="button"
                                  onClick={() => {
                                    setCurrentOrder(o);
                                    setShowOtpBox(false);
                                    setOtp("");
                                    setShowCompleted(false);
                                  }}
                                  className="text-left bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:border-[#ff4d2d]/40 transition"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Mission
                                      </p>
                                      <p className="font-black text-gray-900 truncate">
                                        {(() => {
                                          const missionIndex =
                                            assignedOrders.findIndex(
                                              (x) =>
                                                String(x?._id) ===
                                                String(o?._id),
                                            );
                                          return missionIndex >= 0
                                            ? `Mission ${missionIndex + 1}`
                                            : "Mission";
                                        })()}
                                      </p>
                                      <p className="text-sm text-gray-500 font-semibold truncate">
                                        {(() => {
                                          const status =
                                            o?.shopOrders?.find((so) => {
                                              const assigned =
                                                so?.assignedDeliveryBoy?._id?.toString?.() ||
                                                so?.assignedDeliveryBoy?.toString?.();
                                              return (
                                                assigned ===
                                                userData?._id?.toString?.()
                                              );
                                            })?.status ||
                                            o?.shopOrders?.[0]?.status;

                                          return status === "out of delivery"
                                            ? "Out for Delivery"
                                            : status === "accepted"
                                              ? "Accepted"
                                              : status === "delivered"
                                                ? "Delivered"
                                                : String(
                                                    status || "In progress",
                                                  );
                                        })()}
                                      </p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                      <p className="text-xl font-black text-[#ff4d2d]">
                                        ₹{o.totalAmount}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                      {Array.isArray(availableOrders) &&
                        availableOrders.length > 0 && (
                          <div className="mt-10 bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                                  Take another gig
                                </h3>
                                <p className="mt-1 text-gray-500 font-medium text-sm">
                                  Accept a second order and add it to your
                                  queue.
                                </p>
                              </div>
                              {availableOrders.length > 4 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowAllGigs((prev) => !prev)
                                  }
                                  className="px-4 py-2 rounded-2xl bg-white border border-gray-200 text-xs font-black uppercase tracking-widest text-gray-700 hover:border-[#ff4d2d]/50 transition"
                                >
                                  {showAllGigs
                                    ? "Show less"
                                    : `Show all (${availableOrders.length})`}
                                </button>
                              )}
                            </div>

                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {gigsToShow.map((order) => (
                                <div
                                  key={order._id}
                                  className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Nearby
                                      </p>
                                      <p className="font-black text-gray-900 truncate">
                                        {order.user?.fullName || "Customer"}
                                      </p>
                                      <p className="text-sm text-gray-500 font-semibold truncate">
                                        {order.deliveryAddress?.text}
                                      </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="text-xl font-black text-[#ff4d2d]">
                                        ₹{order.totalAmount}
                                      </p>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleAccept(order._id)}
                                    className="mt-4 w-full bg-gray-900 text-white py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all"
                                  >
                                    Add to queue
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              /* 📢 AVAILABLE GIGS */
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-4">
                    Available Gigs
                    {availableOrders.length > 0 && (
                      <span className="bg-[#ff4d2d] text-white text-[10px] px-3 py-1 rounded-full animate-pulse tracking-widest">
                        {availableOrders.length} NEARBY
                      </span>
                    )}
                  </h2>
                </div>

                {availableOrders.length === 0 ? (
                  <div className="bg-white rounded-[3rem] p-20 text-center border-4 border-dashed border-gray-100">
                    <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MdDeliveryDining className="text-5xl text-gray-200" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">
                      Scanning for Gigs...
                    </h3>
                    <p className="text-gray-400 font-medium">
                      New delivery requests will appear here in real-time.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {availableOrders.map((order) => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 hover:border-[#ff4d2d]/50 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-8">
                          <div className="flex items-center gap-4">
                            <div className="bg-orange-50 p-4 rounded-2xl group-hover:bg-[#ff4d2d] group-hover:text-white transition-all">
                              <FaUtensils size={24} />
                            </div>
                            <div>
                              <h3 className="text-lg font-black text-gray-900 uppercase leading-none mb-1">
                                {order.shopOrders[0]?.shop?.name}
                              </h3>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Restaurant
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-black text-[#ff4d2d]">
                              ₹{order.totalAmount}
                            </p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              Earnings
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-gray-500 font-medium mb-8 bg-gray-50 p-4 rounded-2xl">
                          <FaMapMarkerAlt className="text-[#ff4d2d]" />
                          <span className="text-xs truncate font-bold">
                            {order.deliveryAddress?.text}
                          </span>
                        </div>

                        <button
                          onClick={() => handleAccept(order._id)}
                          className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl group-hover:bg-[#ff4d2d] transition-all flex items-center justify-center gap-3"
                        >
                          <FaMotorcycle size={20} /> Accept Delivery
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 📊 RIGHT COLUMN: STATS */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                <FaChartLine className="text-[#ff4d2d]" /> Performance
              </h2>
              <div className="space-y-4">
                <div className="p-6 bg-[#fffcf8] rounded-4xl border border-orange-50">
                  <p className="text-4xl font-black text-gray-900">
                    {todayDeliveries.length}
                  </p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Today's Missions
                  </p>
                </div>
                <div className="p-6 bg-[#fffcf8] rounded-4xl border border-orange-50">
                  <p className="text-4xl font-black text-[#ff4d2d]">
                    ₹
                    {todayDeliveries.reduce((sum, d) => sum + d.totalAmount, 0)}
                  </p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Daily Revenue
                  </p>
                </div>
                <div className="p-6 bg-[#fffcf8] rounded-4xl border border-orange-50">
                  <div className="flex items-center gap-2">
                    <p className="text-4xl font-black text-gray-900">4.9</p>
                    <span className="text-orange-400 text-xl">★★★★★</span>
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Pilot Rating
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                <FaHistory className="text-[#ff4d2d]" /> Recent Logs
              </h2>
              <div className="space-y-4">
                {todayDeliveries.slice(0, 5).map((d, i) => (
                  <div
                    key={d?._id || i}
                    className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100"
                  >
                    <div>
                      <p className="font-black text-gray-900 text-sm">
                        {getDeliveryLogTitle(d)}
                      </p>
                      <p className="text-[10px] text-gray-400 font-black uppercase">
                        {new Date(d.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <p className="font-black text-green-600">
                      ₹{d.totalAmount}
                    </p>
                  </div>
                ))}
                {todayDeliveries.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 font-medium text-sm">
                      No logs recorded today
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeliveryBoy;
