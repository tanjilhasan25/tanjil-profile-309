import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyClYhcNTHWLEFwyxbAWsHILX59n6_HM_gA",
  authDomain: "tanjil-profile-309.firebaseapp.com",
  projectId: "tanjil-profile-309",
  storageBucket: "tanjil-profile-309.firebasestorage.app",
  messagingSenderId: "1045388470320",
  appId: "1:1045388470320:web:4c1071bd9a4be44e54e5f5",
  measurementId: "G-C4DKZFJPWK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
