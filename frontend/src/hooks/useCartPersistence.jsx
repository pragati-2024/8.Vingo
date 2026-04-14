import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, setCart } from "../redux/userSlice";

const getCartKey = (userId) => `vingo_cart:${userId}`;

const safeParse = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const sanitizeCartItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((i) => {
      if (!i) return null;
      const quantity = Number(i.quantity);
      const price = Number(i.price);
      const next = {
        ...i,
        quantity: Number.isFinite(quantity) ? quantity : 0,
        price: Number.isFinite(price) ? price : 0,
      };
      return next;
    })
    .filter((i) => i && i.quantity > 0);
};

function useCartPersistence() {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.userData?._id) || null;
  const cartItems = useSelector((state) => state.user.cartItems);

  const lastKnownUserIdRef = useRef(null);
  const hydratedForUserRef = useRef(null);

  // Rehydrate cart for this user after login.
  useEffect(() => {
    if (!userId) return;

    const prevUserId = lastKnownUserIdRef.current;
    if (prevUserId && prevUserId !== userId) {
      dispatch(clearCart());
    }
    lastKnownUserIdRef.current = userId;

    // Avoid re-hydrating repeatedly for the same user.
    if (hydratedForUserRef.current === userId) return;
    hydratedForUserRef.current = userId;

    // If cart already has items (e.g., user never left), don't overwrite.
    if (Array.isArray(cartItems) && cartItems.length > 0) return;

    let raw = null;
    try {
      raw = localStorage.getItem(getCartKey(userId));
    } catch {
      raw = null;
    }

    const parsed = safeParse(raw);
    const nextItems = sanitizeCartItems(parsed?.cartItems);
    if (!nextItems.length) return;

    dispatch(setCart({ cartItems: nextItems }));
  }, [dispatch, userId, cartItems]);

  // Persist cart whenever it changes (per-user).
  useEffect(() => {
    if (!userId) return;

    const payload = {
      cartItems: sanitizeCartItems(cartItems),
      savedAt: Date.now(),
    };

    try {
      localStorage.setItem(getCartKey(userId), JSON.stringify(payload));
    } catch {
      // ignore storage errors (private mode/quota)
    }
  }, [userId, cartItems]);
}

export default useCartPersistence;
