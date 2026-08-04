// web/js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { initializeFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD6pEOBet-_ZTX8WAbMGgF6icLfkzErAc8",
  authDomain: "labcontroll.firebaseapp.com",
  projectId: "labcontroll",
  storageBucket: "labcontroll.firebasestorage.app",
  messagingSenderId: "918035619537",
  appId: "1:918035619537:web:95efb91d990405a7262ff0",
  measurementId: "G-Y741VKCM8N"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true });
