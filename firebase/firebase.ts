import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCdp3ieuKbsQf8omEG7IIDjiSEpow4NGrQ",
  authDomain: "skillverse-c2c4e.firebaseapp.com",
  projectId: "skillverse-c2c4e",
  storageBucket: "skillverse-c2c4e.firebasestorage.app",
  messagingSenderId: "222851148130",
  appId: "1:222851148130:web:7f5af61446bc627fde243b"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Enforce browser local persistence (default, but explicitly stated for security/clarity)
setPersistence(auth, browserLocalPersistence)
  .catch((error) => console.error("Firebase persistence error:", error));
