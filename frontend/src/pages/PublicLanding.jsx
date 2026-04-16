import React from "react";
import { useNavigate } from "react-router-dom";

function PublicLanding() {
  const navigate = useNavigate();

  return (
    <div className="w-full flex items-center justify-center px-4 pt-27.5 pb-10">
      <div className="w-full max-w-xl bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <h2 className="text-3xl md:text-4xl font-black text-white">
          Welcome to <span className="text-[#ff4d2d]">Vingo</span>
        </h2>
        <p className="mt-3 text-white/85 font-semibold leading-relaxed">
          Cravings, delivered. <span className="text-white">Sign Up</span> in
          seconds — or <span className="text-white">Sign In</span> to pick up
          where you left off.
        </p>
        <p className="mt-3 text-xs text-white/60 font-semibold tracking-wide">
          Fresh picks • Live tracking • Secure checkout
        </p>

        <div className="mt-7 flex items-center justify-center gap-3">
          <button
            className="px-5 py-2.5 rounded-xl bg-linear-to-r from-[#ff4d2d] to-[#ff416c] text-white font-bold shadow-md hover:shadow-lg transition"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
          <button
            className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition"
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
