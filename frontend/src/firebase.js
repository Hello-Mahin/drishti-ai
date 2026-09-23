import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Default to live project drishti-ai-b2c66 credentials
const firebaseConfig = {
  apiKey:
    import.meta.env?.VITE_FIREBASE_API_KEY ||
    (typeof process !== 'undefined' && process.env?.REACT_APP_FIREBASE_API_KEY) ||
    'AIzaSyAYZdmAsnk9oNBdBoAUwpmBgpxEAiPLvg4',
  authDomain:
    import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN ||
    (typeof process !== 'undefined' && process.env?.REACT_APP_FIREBASE_AUTH_DOMAIN) ||
    'drishti-ai-b2c66.firebaseapp.com',
  projectId:
    import.meta.env?.VITE_FIREBASE_PROJECT_ID ||
    (typeof process !== 'undefined' && process.env?.REACT_APP_FIREBASE_PROJECT_ID) ||
    'drishti-ai-b2c66',
  storageBucket:
    import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET ||
    (typeof process !== 'undefined' && process.env?.REACT_APP_FIREBASE_STORAGE_BUCKET) ||
    'drishti-ai-b2c66.firebasestorage.app',
  messagingSenderId:
    import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    (typeof process !== 'undefined' && process.env?.REACT_APP_FIREBASE_MESSAGING_SENDER_ID) ||
    '36875821543',
  appId:
    import.meta.env?.VITE_FIREBASE_APP_ID ||
    (typeof process !== 'undefined' && process.env?.REACT_APP_FIREBASE_APP_ID) ||
    '1:36875821543:web:ceb276187823fb64741644',
  measurementId:
    import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID ||
    'G-DREDLDM4RV',
};

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (error) {
  console.warn('Firebase initialization error:', error);
}

export const isFirebaseConfigured = Boolean(auth && db);
export { auth, db, googleProvider };
