
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

cconst firebaseConfig = {
  apiKey: "AIzaSyCANuI_7iQGvvBH5YmVIa3p_yUPw8oG_B0",
  authDomain: "firstsight-8f660.firebaseapp.com",
  databaseURL: "https://firstsight-8f660-default-rtdb.firebaseio.com",
  projectId: "firstsight-8f660",
  storageBucket: "firstsight-8f660.firebasestorage.app",
  messagingSenderId: "517418928090",
  appId: "1:517418928090:web:f93583c4ab9b9be7c822e3"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);

export default app;
