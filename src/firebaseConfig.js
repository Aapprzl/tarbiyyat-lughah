import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBQEKkxhFgwh6lYwoVg9qcT1NSqAVCb6xo",
  authDomain: "tarbiyyat-lughah.firebaseapp.com",
  projectId: "tarbiyyat-lughah",
  storageBucket: "tarbiyyat-lughah.firebasestorage.app",
  messagingSenderId: "432557406512",
  appId: "1:432557406512:web:deb4be6a9141a1fed1b0f5",
  measurementId: "G-4EPDQRTJDT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Connect to default database
const storage = getStorage(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, storage, auth, analytics };
