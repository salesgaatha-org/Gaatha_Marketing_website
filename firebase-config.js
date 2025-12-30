// Firebase Configuration
// Your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyBQlBj179byUqKjjXGH1TmpqT36nlDhwaY",
    authDomain: "gaatha-b9ee5.firebaseapp.com",
    projectId: "gaatha-b9ee5",
    storageBucket: "gaatha-b9ee5.firebasestorage.app",
    messagingSenderId: "661713784587",
    appId: "1:661713784587:web:2b7bbcb40b18e53c361c0e",
    measurementId: "G-75RTC8CXEE"
};

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Export for use in other files
export { db, auth };
