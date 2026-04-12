import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import axios from "axios";

try {
  const token = localStorage.getItem("vingo_token");
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
} catch {
  // ignore
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,
);
