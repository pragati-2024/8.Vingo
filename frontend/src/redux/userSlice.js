import { createSlice } from "@reduxjs/toolkit";

const dedupeById = (list) => {
  if (!Array.isArray(list)) return list;
  const map = new Map();
  for (const item of list) {
    const id = item?._id?.toString?.() ?? item?.id?.toString?.();
    if (!id) continue;
    if (!map.has(id)) map.set(id, item);
  }
  return Array.from(map.values());
};

const getOrderDedupeKey = (order) => {
  const orderId = order?._id?.toString?.() ?? "";
  if (!orderId) return null;

  // Owner structure: { _id, shopOrder: { shop: ... } }
  if (order?.shopOrder) {
    const shopId =
      order.shopOrder?.shop?._id?.toString?.() ??
      order.shopOrder?.shop?.toString?.() ??
      "";
    return shopId ? `${orderId}:${shopId}` : orderId;
  }

  // User structure: { _id, shopOrders: [...] }
  return orderId;
};

const dedupeOrders = (orders) => {
  if (!Array.isArray(orders)) return orders;
  const seen = new Set();
  const out = [];
  for (const o of orders) {
    const key = getOrderDedupeKey(o);
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(o);
  }
  return out;
};

const normalizeShopId = (maybeShop) => {
  if (!maybeShop) return maybeShop;
  if (typeof maybeShop === "string") return maybeShop;
  return (
    maybeShop?._id?.toString?.() ?? maybeShop?.id?.toString?.() ?? maybeShop
  );
};

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: undefined, // undefined means still loading, null means logged out
    currentCity: null,
    currentState: null,
    currentAddress: null,
    shopInMyCity: null,
    itemsInMyCity: null,
    cartItems: [],
    totalAmount: 0,
    myOrders: [],
    loadingOrders: false,
    searchItems: null,
    socket: null,
  },
  reducers: {
    setUserData: (state, action) => {
      const prevUserId = state.userData?._id?.toString?.();
      const nextUserId = action.payload?._id?.toString?.();

      state.userData = action.payload;

      // Prevent cart leaking across accounts or after logout.
      const prevHadUser = Boolean(prevUserId);
      const nextHadUser = Boolean(nextUserId);
      const userChanged =
        prevHadUser && nextHadUser && prevUserId !== nextUserId;
      const loggedOut = prevHadUser && !nextHadUser && action.payload === null;
      if (userChanged || loggedOut) {
        state.cartItems = [];
        state.totalAmount = 0;
        state.myOrders = [];
      }
    },
    setUserOnline: (state, action) => {
      if (state.userData) {
        state.userData.isOnline = action.payload;
      }
    },
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload;
    },
    setCurrentState: (state, action) => {
      state.currentState = action.payload;
    },
    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload;
    },
    setShopsInMyCity: (state, action) => {
      state.shopInMyCity =
        action.payload === null ? null : dedupeById(action.payload);
    },
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity =
        action.payload === null ? null : dedupeById(action.payload);
    },
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    addToCart: (state, action) => {
      const cartItem = action.payload;
      if (cartItem && cartItem.shop) {
        cartItem.shop = normalizeShopId(cartItem.shop);
      }
      const existingItem = state.cartItems.find((i) => i.id == cartItem.id);
      if (existingItem) {
        existingItem.quantity += cartItem.quantity;
      } else {
        state.cartItems.push(cartItem);
      }

      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
    },

    setTotalAmount: (state, action) => {
      state.totalAmount = action.payload;
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find((i) => i.id == id);
      if (item) {
        item.quantity = quantity;
      }
      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
    },

    removeCartItem: (state, action) => {
      state.cartItems = state.cartItems.filter((i) => i.id !== action.payload);
      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
    },

    clearCart: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
    },

    setMyOrders: (state, action) => {
      state.myOrders = dedupeOrders(action.payload);
    },
    setLoadingOrders: (state, action) => {
      state.loadingOrders = action.payload;
    },
    addMyOrder: (state, action) => {
      const next = action.payload;
      const key = getOrderDedupeKey(next);
      if (!key) return;
      const exists = Array.isArray(state.myOrders)
        ? state.myOrders.some((o) => getOrderDedupeKey(o) === key)
        : false;
      if (exists) return;
      state.myOrders = [
        next,
        ...(Array.isArray(state.myOrders) ? state.myOrders : []),
      ];
    },

    removeMyOrder: (state, action) => {
      const { orderId, shopId } = action.payload || {};
      if (!orderId) return;
      if (!Array.isArray(state.myOrders)) return;

      // If shopId provided, remove only the owner-suborder entry for that shop.
      if (shopId) {
        const shopIdStr = String(shopId);
        state.myOrders = state.myOrders.filter((o) => {
          if (String(o?._id) !== String(orderId)) return true;
          const oShopId =
            o?.shopOrder?.shop?._id?.toString?.() ??
            o?.shopOrder?.shop?.toString?.() ??
            "";
          return oShopId !== shopIdStr;
        });
        return;
      }

      // Otherwise remove the whole order (user structure).
      state.myOrders = state.myOrders.filter(
        (o) => String(o?._id) !== String(orderId),
      );
    },

    updateOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload;
      const order = state.myOrders.find((o) => o._id == orderId);
      if (order) {
        if (order.shopOrders && order.shopOrders.shop._id == shopId) {
          order.shopOrders.status = status;
        }
      }
    },

    updateRealtimeOrderStatus: (state, action) => {
      const { orderId, shopId, status, deliveryBoy } = action.payload;
      if (!Array.isArray(state.myOrders)) return;

      const order = state.myOrders.find(
        (o) => o._id?.toString() === orderId?.toString(),
      );
      if (order) {
        if (Array.isArray(order.shopOrders)) {
          // User structure
          const shopOrder = order.shopOrders.find(
            (so) =>
              (so.shop?._id?.toString() || so.shop?.toString()) ===
              shopId?.toString(),
          );
          if (shopOrder) {
            shopOrder.status = status;
            if (deliveryBoy) shopOrder.assignedDeliveryBoy = deliveryBoy;
          }
        } else if (order.shopOrder) {
          // Owner structure
          const orderShopId =
            order.shopOrder.shop?._id?.toString() ||
            order.shopOrder.shop?.toString();
          if (orderShopId === shopId?.toString()) {
            order.shopOrder.status = status;
            if (deliveryBoy) order.shopOrder.assignedDeliveryBoy = deliveryBoy;
          }
        }
      }
    },

    setSearchItems: (state, action) => {
      state.searchItems = action.payload;
    },
  },
});

export const {
  setUserData,
  setUserOnline,
  setCurrentAddress,
  setCurrentCity,
  setCurrentState,
  setShopsInMyCity,
  setItemsInMyCity,
  addToCart,
  updateQuantity,
  removeCartItem,
  clearCart,
  setMyOrders,
  setLoadingOrders,
  addMyOrder,
  removeMyOrder,
  updateOrderStatus,
  setSearchItems,
  setTotalAmount,
  setSocket,
  updateRealtimeOrderStatus,
} = userSlice.actions;
export default userSlice.reducer;
