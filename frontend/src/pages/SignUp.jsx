import React from "react";
import { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, firebaseProjectInfo } from "../../firebase";
import { ClipLoader } from "react-spinners";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
function SignUp() {
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");
  const navigate = useNavigate();
  const location = useLocation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  React.useEffect(() => {
    const state = location?.state;
    if (!state) return;
    if (typeof state.googleFullName === "string" && !fullName) {
      setFullName(state.googleFullName);
    }
    if (typeof state.googleEmail === "string" && !email) {
      setEmail(state.googleEmail);
    }
  }, [location, fullName, email]);
  const handleSignUp = async () => {
    setLoading(true);
    setErr("");

    const trimmedFullName = String(fullName || "").trim();
    const trimmedEmail = String(email || "").trim();
    const trimmedMobile = String(mobile || "").trim();
    const trimmedPassword = String(password || "").trim();
    const digitsMobile = trimmedMobile.replace(/\D/g, "");

    if (
      !trimmedFullName ||
      !trimmedEmail ||
      !trimmedPassword ||
      !trimmedMobile ||
      !role
    ) {
      setErr("All fields are required.");
      setLoading(false);
      return;
    }
    if (trimmedPassword.length < 6) {
      setErr("password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    if (digitsMobile.length < 10) {
      setErr("mobile no must be at least 10 digits.");
      setLoading(false);
      return;
    }

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/register`,
        {
          fullName: trimmedFullName,
          email: trimmedEmail,
          password: trimmedPassword,
          mobile: digitsMobile,
          role,
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
      const msg = error?.response?.data?.message;
      if (msg === "User Already exist.") {
        setErr("Email already registered. Please Sign In.");
      } else {
        setErr(msg || "Sign up failed");
      }
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!mobile) {
      return setErr("mobile no is required");
    }
    const provider = new GoogleAuthProvider();
    try {
      const normalizedMobile = String(mobile).trim().replace(/\D/g, "");
      if (normalizedMobile.length < 10) {
        setErr("mobile no must be at least 10 digits.");
        return;
      }
      const result = await signInWithPopup(auth, provider);
      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
          role,
          mobile: normalizedMobile,
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
          Create your account to get started with delicious food deliveries
        </p>

        {/* fullName */}

        <div className="mb-4">
          <label
            htmlFor="fullName"
            className="block text-gray-700 font-medium mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none "
            placeholder="Enter your Full Name"
            style={{ border: `1px solid ${borderColor}` }}
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            required
          />
        </div>
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
        {/* mobile*/}

        <div className="mb-4">
          <label
            htmlFor="mobile"
            className="block text-gray-700 font-medium mb-1"
          >
            Mobile
          </label>
          <input
            type="tel"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none "
            placeholder="Enter your Mobile Number"
            style={{ border: `1px solid ${borderColor}` }}
            onChange={(e) => setMobile(e.target.value)}
            value={mobile}
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
        {/* role*/}

        <div className="mb-4">
          <label
            htmlFor="role"
            className="block text-gray-700 font-medium mb-1"
          >
            Role
          </label>
          <div className="flex gap-2">
            {["user", "owner", "deliveryBoy"].map((r) => (
              <button
                key={r}
                type="button"
                className="flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors cursor-pointer"
                onClick={() => setRole(r)}
                style={
                  role == r
                    ? { backgroundColor: primaryColor, color: "white" }
                    : {
                        border: `1px solid ${primaryColor}`,
                        color: primaryColor,
                      }
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <button
          className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
          onClick={handleSignUp}
          disabled={loading}
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Sign Up"}
        </button>
        {err && <p className="text-red-500 text-center my-2.5">*{err}</p>}

        <button
          className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition cursor-pointer duration-200 border-gray-400 hover:bg-gray-100"
          onClick={handleGoogleAuth}
        >
          <FcGoogle size={20} />
          <span>Sign up with Google</span>
        </button>
        <p
          className="text-center mt-6 cursor-pointer"
          onClick={() => navigate("/signin")}
        >
          Already have an account ?{" "}
          <span className="text-[#ff4d2d]">Sign In</span>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
