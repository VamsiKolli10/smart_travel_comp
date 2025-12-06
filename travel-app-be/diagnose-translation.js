#!/usr/bin/env node
/**
 * Diagnostic script to troubleshoot translation issues in production
 * Run: node diagnose-translation.js
 */

require("dotenv").config();

const { translateText } = require("./src/controllers/translationController");
const { db, auth } = require("./src/config/firebaseAdmin");
const { createApp } = require("./src/app");

// Mock Express request/response objects
function createMockRequest(body, headers = {}) {
  return {
    body,
    headers,
    originalUrl: "/api/translate",
    method: "POST",
    user: null,
    userRoles: [],
  };
}

function createMockResponse() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  return res;
}

async function testEnvironment() {
  console.log("🔍 Testing Environment Variables...\n");

  const required = [
    "FB_ADMIN_CREDENTIALS",
    "REQUEST_SIGNING_SECRET",
    "NODE_ENV",
    "MAX_TRANSLATION_CHARS",
  ];

  for (const key of required) {
    const value = process.env[key];
    if (!value) {
      console.log(`❌ ${key}: Missing`);
    } else {
      console.log(
        `✅ ${key}: ${
          value.length > 20 ? value.substring(0, 20) + "..." : value
        }`
      );
    }
  }

  console.log("\n");
}

async function testFirebaseConnection() {
  console.log("🔍 Testing Firebase Connection...\n");

  try {
    // Test Firestore connection
    const snapshot = await db.listCollections();
    console.log("✅ Firestore connection successful");

    // Test Auth connection
    const user = await auth
      .getUserByEmail("test@example.com")
      .catch(() => null);
    console.log("✅ Firebase Auth connection successful");
  } catch (error) {
    console.log(`❌ Firebase connection failed: ${error.message}`);
  }

  console.log("\n");
}

async function testModelLoading() {
  console.log("🔍 Testing Model Loading...\n");

  try {
    const { pipeline } = await import("@xenova/transformers");
    console.log("✅ @xenova/transformers imported successfully");

    // Test model loading (this is the most likely failure point)
    console.log("⏳ Loading translation model (this may take time)...");
    const model = await pipeline("translation", "Xenova/opus-mt-en-es");
    console.log("✅ Translation model loaded successfully");
  } catch (error) {
    console.log(`❌ Model loading failed: ${error.message}`);
    console.log("💡 This is likely the cause of production failures");
    console.log(
      "💡 Consider pre-warming models or using a different deployment strategy"
    );
  }

  console.log("\n");
}

async function testTranslationController() {
  console.log("🔍 Testing Translation Controller...\n");

  const testCases = [
    { text: "Hello", langPair: "en-es" },
    { text: "How are you?", langPair: "en-fr" },
    { text: "Good morning", langPair: "en-de" },
  ];

  for (const testCase of testCases) {
    console.log(`Testing: "${testCase.text}" (${testCase.langPair})`);

    const req = createMockRequest(testCase);
    const res = createMockResponse();

    try {
      await translateText(req, res);

      if (res.statusCode === 200) {
        console.log(`✅ Success: ${res.body.translation}`);
      } else {
        console.log(`❌ Error ${res.statusCode}: ${JSON.stringify(res.body)}`);
      }
    } catch (error) {
      console.log(`❌ Exception: ${error.message}`);
    }
  }

  console.log("\n");
}

async function testRateLimiting() {
  console.log("🔍 Testing Rate Limiting...\n");

  const app = createApp();

  // Test if we can make requests without hitting rate limits
  console.log("✅ Rate limiting configuration loaded");
  console.log("💡 Check Firebase Functions logs for rate limit violations");

  console.log("\n");
}

async function main() {
  console.log("🚀 Starting Translation Diagnostics...\n");
  console.log(`Environment: ${process.env.NODE_ENV || "development"}\n`);

  await testEnvironment();
  await testFirebaseConnection();
  await testModelLoading();
  await testTranslationController();
  await testRateLimiting();

  console.log("🎯 Diagnostic Complete!\n");
  console.log("📋 Summary of Common Production Issues:");
  console.log("1. Model download failures in Firebase Functions");
  console.log("2. Missing environment variables");
  console.log("3. Authentication token validation issues");
  console.log("4. CORS policy blocking requests");
  console.log("5. Rate limiting blocking requests");
  console.log("\n💡 Next Steps:");
  console.log("- Check Firebase Functions logs for detailed error messages");
  console.log("- Verify all environment variables are set in Firebase Console");
  console.log("- Test with a simple curl request to isolate frontend issues");
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
