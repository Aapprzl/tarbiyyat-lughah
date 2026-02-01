import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAvXJGHhbomld89iHcXEM7r30kzLj-Y6oY",
  authDomain: "bahasa-arab-praktis.firebaseapp.com",
  projectId: "bahasa-arab-praktis",
  storageBucket: "bahasa-arab-praktis.firebasestorage.app",
  messagingSenderId: "238575752411",
  appId: "1:238575752411:web:3e4af6b7071dec02f768fe"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'admin-kaq'); // Connect to specific database
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };
