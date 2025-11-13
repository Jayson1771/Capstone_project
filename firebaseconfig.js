import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
const firebaseConfig = {
    apiKey: "AIzaSyA3Rffsm4TGfStIbWel37h_MvBfm9EyR1o",
    authDomain: "capstone-76e45.firebase.com",
    projectId: "capstone-76e45",
    storageBucket: "capstone-76e45.firebasestorage.app",
    messagingSenderId: "693716710529",
    appId: '1:693716710529:android:8408efb61f9104ffed4980',
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
export { auth, db };