// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const requireEnv = (key) => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(
      `Missing ${key}. Set it in frontend/.env and restart the dev server.`,
    );
  }
  return value;
};

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: requireEnv("VITE_FIREBASE_APIKEY"),
  authDomain: requireEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: requireEnv("VITE_FIREBASE_PROJECT_ID"),
  // Optional for auth, but used by other Firebase products
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
// console.log(import.meta.env.VITE_FIREBASE_APIKEY);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const firebaseProjectInfo = {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
};

export { app, auth };
