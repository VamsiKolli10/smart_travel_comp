// src/config/firebase.js
require("dotenv").config();

// Import Firebase SDK functions
const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { getFirestore } = require("firebase/firestore");
const { getStorage } = require("firebase/storage");

// Firebase configuration object
function readEnv(key, fallbackKey) {
  return process.env[key] || process.env[fallbackKey];
}

const firebaseConfig = {
  apiKey: readEnv("FBAPP_API_KEY", "FIREBASE_API_KEY"),
  authDomain: readEnv("FBAPP_AUTH_DOMAIN", "FIREBASE_AUTH_DOMAIN"),
  projectId: readEnv("FBAPP_PROJECT_ID", "FIREBASE_PROJECT_ID"),
  storageBucket: readEnv("FBAPP_STORAGE_BUCKET", "FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: readEnv(
    "FBAPP_MESSAGING_SENDER_ID",
    "FIREBASE_MESSAGING_SENDER_ID"
  ),
  appId: readEnv("FBAPP_APP_ID", "FIREBASE_APP_ID"),
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

module.exports = {
  app,
  auth,
  db,
  storage,
};
