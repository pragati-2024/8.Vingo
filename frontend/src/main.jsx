import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import { setUserData } from "./redux/userSlice.js";
import axios from "axios";
import { serverUrl } from "./config.js";

// Only send auth headers/cookies to our own backend.
// Prevents third-party APIs (e.g., Geoapify) from failing CORS preflights due to Authorization.
axios.interceptors.request.use((config) => {
  const url = String(config?.url || "");
  const isAbsolute = /^https?:\/\//i.test(url);
  const isBackend = !isAbsolute || url.startsWith(serverUrl);

  const headers = config.headers || {};
  const hasAxiosHeadersApi =
    typeof headers === "object" &&
    headers !== null &&
    typeof headers.set === "function" &&
    typeof headers.delete === "function";

  const setAuthHeader = (value) => {
    if (hasAxiosHeadersApi) headers.set("Authorization", value);
    else headers.Authorization = value;
  };

  const deleteAuthHeader = () => {
    if (hasAxiosHeadersApi) headers.delete("Authorization");
    else delete headers.Authorization;
  };

  if (isBackend) {
    try {
      const token = localStorage.getItem("vingo_token");
      if (token) setAuthHeader(`Bearer ${token}`);
      else deleteAuthHeader();
    } catch {
      deleteAuthHeader();
    }
  } else {
    // Never send auth/cookies to third-party APIs.
    deleteAuthHeader();
    config.withCredentials = false;
  }

  config.headers = headers;
  return config;
});

// If a stale/expired token is stored in localStorage, it can override a valid
// cookie session (because we attach Authorization). Clearing it on 401 helps
// recovery without requiring a hard refresh.
axios.interceptors.response.use(
  (res) => res,
  (error) => {
    try {
      const status = error?.response?.status;
      const url = String(error?.config?.url || "");
      const isAbsolute = /^https?:\/\//i.test(url);
      const isBackend = !isAbsolute || url.startsWith(serverUrl);

      if (status === 401 && isBackend) {
        localStorage.removeItem("vingo_token");
        store.dispatch(setUserData(null));
      }
    } catch {
      // ignore
    }
    return Promise.reject(error);
  },
);

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,
);
