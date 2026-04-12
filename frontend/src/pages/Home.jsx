import React from "react";
import { useSelector } from "react-redux";
import UserDashboard from "../components/UserDashBoard";
import OwnerDashboard from "../components/ownerDashBoard";
import DeliveryBoy from "../components/DeliveryBoy";

function Home() {
  const { userData } = useSelector((state) => state.user);
  return (
    <div className="w-full min-h-[100vh] flex flex-col items-center bg-[#fff9f6]">
      {userData?.role === "user" && <UserDashboard />}
      {userData?.role === "owner" && <OwnerDashboard />}
      {userData?.role === "deliveryBoy" && <DeliveryBoy />}
    </div>
  );
}

export default Home;
