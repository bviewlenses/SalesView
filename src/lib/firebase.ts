import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// Replace these with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyCm3wQWFXF1ECII2T6ZIf6L-1CUP9vZkNc",
  authDomain: "salesview-a1e08.firebaseapp.com",
  projectId: "salesview-a1e08",
  storageBucket: "salesview-a1e08.firebasestorage.app",
  messagingSenderId: "1082386639291",
  appId: "1:1082386639291:web:e82a141e40a4a2fb227c9e",
  measurementId: "G-TJ1JF3P1V3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;