import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Firebase configuration - REPLACE WITH YOUR FIREBASE PROJECT CREDENTIALS
const firebaseConfig = {
  apiKey: "AIzaSyCIv-7ocz7g24aOaqxhS133vY4ah7qCMYU",
  authDomain: "link-logic-4daf9.firebaseapp.com",
  databaseURL: "https://link-logic-4daf9-default-rtdb.firebaseio.com",
  projectId: "link-logic-4daf9",
  storageBucket: "link-logic-4daf9.firebasestorage.app",
  messagingSenderId: "553259419472",
  appId: "1:553259419472:web:5370c15d897ae1a6598e55"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);
export const auth = getAuth(app);

export default app;