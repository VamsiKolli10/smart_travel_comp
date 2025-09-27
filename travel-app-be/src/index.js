// src/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import Firebase configurations
const { db: clientDb } = require("./config/firebase");
const { db: adminDb } = require("./config/firebaseAdmin");

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Firebase Node.js API is running!",
    timestamp: new Date().toISOString(),
  });
});

// Test Firebase connection
app.get("/test-firebase", async (req, res) => {
  try {
    // Test Firestore connection
    const testDoc = adminDb.collection("test").doc("connection");
    await testDoc.set({
      message: "Firebase connection successful!",
      timestamp: new Date(),
    });

    res.json({ success: true, message: "Firebase is connected!" });
  } catch (error) {
    console.error("Firebase connection error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
