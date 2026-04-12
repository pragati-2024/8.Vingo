import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resolveMediaUrl, serverUrl } from "../config";
import { useDispatch, useSelector } from "react-redux";
import { removeMyOrder } from "../redux/userSlice";

function UserOrderCard({ data }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const [selectedRating, setSelectedRating] = useState({}); //itemId:rating

  const formatStatus = (status) => {
    const s = String(status || "").trim().toLowerCase();
    if (!s) return "";
    if (s === "delivered") return "Completed";
    if (s === "out of delivery") return "Out for Delivery";
    if (s === "accepted") return "Accepted";
    if (s === "pending") return "Pending";
    return s
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleRating = async (itemId, rating) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/item/rating`,
        { itemId, rating },
        { withCredentials: true },
      );
      setSelectedRating((prev) => ({
        ...prev,
        [itemId]: rating,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex justify-between border-b pb-2">
        <div>
          <p className="font-semibold">order #{data._id.slice(-6)}</p>
          <p className="text-sm text-gray-500">
            Date: {formatDate(data.createdAt)}
          </p>
        </div>
        <div className="text-right">
          {data.paymentMethod == "cod" ? (
            <p className="text-sm text-gray-500">
              {data.paymentMethod?.toUpperCase()}
            </p>
          ) : (
            <p className="text-sm text-gray-500 font-semibold">
              Payment: {data.payment ? "true" : "false"}
            </p>
          )}

          <p className="font-medium text-blue-600">
            {formatStatus(data.shopOrders?.[0].status)}
          </p>
        </div>
      </div>

      {data.shopOrders.map((shopOrder, index) => (
        <div
          className="border rounded-lg p-3 bg-[#fffaf7] space-y-3"
          key={index}
        >
          <p className="font-bold text-gray-800">
            {shopOrder.shop?.name || "Shop Name"}
          </p>

          <div className="flex space-x-4 overflow-x-auto pb-2">
            {shopOrder.shopOrderItems.map((item, index) => (
              <div
                key={index}
                className="shrink-0 w-40 border rounded-lg p-2 bg-white"
              >
                {item.item?.image && (
                  <img
                    src={resolveMediaUrl(item.item.image)}
                    alt=""
                    className="w-full h-24 object-cover rounded"
                  />
                )}
                <p className="text-sm font-semibold mt-1">
                  {item.name || item.item?.name || "Item"}
                </p>
                <p className="text-xs text-gray-500">
                  Qty: {item.quantity} x ₹{item.price}
                </p>

                {shopOrder.status == "delivered" && item.item?._id && (
                  <div className="flex space-x-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`text-lg ${selectedRating[item.item._id] >= star ? "text-yellow-400" : "text-gray-400"}`}
                        onClick={() => handleRating(item.item._id, star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center border-t pt-2">
            <p className="font-semibold text-gray-700">
              Subtotal: ₹{shopOrder.subtotal}
            </p>
            <span className="text-sm font-black uppercase text-[#ff4d2d]">
              {formatStatus(shopOrder.status)}
            </span>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center border-t pt-2">
        <p className="font-semibold">Total: ₹{data.totalAmount}</p>
        <div className="flex items-center gap-2">
          {userData?.role === "deliveryBoy" ? (
            <button
              className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm"
              onClick={() => navigate("/")}
              type="button"
            >
              Open Delivery Panel
            </button>
          ) : (
            <>
              <button
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold"
                onClick={() => dispatch(removeMyOrder({ orderId: data._id }))}
                type="button"
              >
                Remove
              </button>
              <button
                className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm"
                onClick={() => navigate(`/track-order/${data._id}`)}
                type="button"
              >
                Track Order
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserOrderCard;
