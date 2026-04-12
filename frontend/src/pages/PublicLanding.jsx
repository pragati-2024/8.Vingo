import React from "react";
import { useNavigate } from "react-router-dom";

function PublicLanding() {
  const navigate = useNavigate();

  return (
    <div className="w-full flex items-center justify-center px-4 pt-[110px] pb-10">
      <div className="w-full max-w-xl bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-10 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-white">
          Welcome to <span className="text-[#ff4d2d]">Vingo</span>
        </h2>
        <p className="mt-3 text-white/80 font-semibold">
          Aage badhne ke liye pehle <span className="text-white">Sign Up</span>{" "}
          ya <span className="text-white">Sign In</span> karein.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            className="px-5 py-2 rounded-xl bg-[#ff4d2d] text-white font-bold"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
          <button
            className="px-5 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-bold"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default PublicLanding;
