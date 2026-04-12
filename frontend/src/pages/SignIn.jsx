import React from "react";
import { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, firebaseProjectInfo } from "../../firebase";
import { ClipLoader } from "react-spinners";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
function SignIn() {
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";

  const bgColor = "#fff9f6";
  const borderColor = "#ddd";
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const handleSignIn = async () => {
    setLoading(true);
    setErr("");

    const trimmedEmail = String(email || "").trim();
    const trimmedPassword = String(password || "");
    if (!trimmedEmail || !trimmedPassword) {
      setErr("email and password are required.");
      setLoading(false);
      return;
    }

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/login`,
        {
          email: trimmedEmail,
          password: trimmedPassword,
        },
        { withCredentials: true },
      );

      try {
        if (result?.data?.token) {
          localStorage.setItem("vingo_token", result.data.token);
          axios.defaults.headers.common.Authorization = `Bearer ${result.data.token}`;
        }
      } catch {
        // ignore
      }

      dispatch(setUserData(result.data));
      setErr("");
      setLoading(false);
    } catch (error) {
      setErr(error?.response?.data?.message);
      setLoading(false);
    }
  };
  const handleGoogleAuth = async () => {
    setErr("");

    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      try {
        const { data } = await axios.post(
          `${serverUrl}/api/auth/google-auth`,
          {
            fullName: result.user.displayName,
            email: result.user.email,
          },
          { withCredentials: true },
        );

        try {
          if (data?.token) {
            localStorage.setItem("vingo_token", data.token);
            axios.defaults.headers.common.Authorization = `Bearer ${data.token}`;
          }
        } catch {
          // ignore
        }

        dispatch(setUserData(data));
        setErr("");
      } catch (apiError) {
        const msg = apiError?.response?.data?.message;
        // For new Google users, backend requires mobile + role (because User schema needs them)
        if (
          apiError?.response?.status === 400 &&
          typeof msg === "string" &&
          msg.toLowerCase().includes("sign up with google")
        ) {
          navigate("/signup", {
            state: {
              googleFullName: result.user.displayName,
              googleEmail: result.user.email,
            },
          });
          return;
        }
        setErr(msg || "Google sign-in failed");
      }
    } catch (error) {
      const code = error?.code;

      if (code === "auth/popup-blocked") {
        setErr("Popup blocked. Allow popups for localhost and try again.");
        return;
      }
      if (code === "auth/popup-closed-by-user") {
        setErr("Popup closed. Please try again.");
        return;
      }

      if (
        code === "auth/invalid-continue-uri" ||
        code === "auth/unauthorized-domain"
      ) {
        const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        setErr(
          `Google Sign-In blocked by Firebase.\n\nOpen Firebase Console for project: ${firebaseProjectInfo.projectId}\nAuth domain in app: ${firebaseProjectInfo.authDomain}\nYour site origin: ${origin}\n\nThen add domain \"localhost\" in Auth > Settings > Authorized domains and enable Google provider.`,
        );
        return;
      }

      setErr(
        error?.response?.data?.message ||
          error?.message ||
          "Google sign-in failed",
      );
    }
  };
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className={`bg-white rounded-xl shadow-lg w-full max-w-md p-8 border `}
        style={{
          border: `1px solid ${borderColor}`,
        }}
      >
        <h1
          className={`text-3xl font-bold mb-2 `}
          style={{ color: primaryColor }}
        >
          Vingo
        </h1>
        <p className="text-gray-600 mb-8">
          {" "}
          Sign In to your account to get started with delicious food deliveries
        </p>

        {/* email */}

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-1"
          >
            Email
          </label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none "
            placeholder="Enter your Email"
            style={{ border: `1px solid ${borderColor}` }}
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>
        {/* password*/}

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 font-medium mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={`${showPassword ? "text" : "password"}`}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none pr-10"
              placeholder="Enter your password"
              style={{ border: `1px solid ${borderColor}` }}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />

            <button
              className="absolute right-3 cursor-pointer top-3.5 text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </div>
        <div
          className="text-right mb-4 cursor-pointer text-[#ff4d2d] font-medium"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password
        </div>

        <button
          className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Sign In"}
        </button>
        {err && <p className="text-red-500 text-center my-2.5">*{err}</p>}

        <button
          className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition cursor-pointer duration-200 border-gray-400 hover:bg-gray-100"
          onClick={handleGoogleAuth}
        >
          <FcGoogle size={20} />
          <span>Sign In with Google</span>
        </button>
        <p
          className="text-center mt-6 cursor-pointer"
          onClick={() => navigate("/signup")}
        >
          Want to create a new account ?{" "}
          <span className="text-[#ff4d2d]">Sign Up</span>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
