import { initializeApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDpOiPnTSjoI7PFZRYEoInXhm_hKJzGJGk",
  authDomain: "expense-tracker-410b8.firebaseapp.com",
  projectId: "expense-tracker-410b8",
  storageBucket: "expense-tracker-410b8.firebasestorage.app",
  messagingSenderId: "944205503405",
  appId: "1:944205503405:web:40f6a58abeac454c459f24",
  measurementId: "G-RT4Z79JGNF"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };