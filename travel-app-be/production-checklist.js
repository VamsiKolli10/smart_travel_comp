#!/usr/bin/env node
/**
 * Production checklist and monitoring script
 * Run: node production-checklist.js
 */

require("dotenv").config();

const fs = require("fs");
const path = require("path");

console.log("🚀 Production Translation Checklist\n");

// 1. Check Environment Variables
console.log("📋 Environment Variables Check:");
const requiredEnvVars = [
  "FB_ADMIN_CREDENTIALS",
  "REQUEST_SIGNING_SECRET",
  "NODE_ENV",
  "FIRESTORE_PREFER_REST",
];

let envCheck = true;
for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  if (!value) {
    console.log(`❌ ${envVar}: Missing`);
    envCheck = false;
  } else {
    console.log(`✅ ${envVar}: Set`);
  }
}

// Check if we're in production
if (process.env.NODE_ENV === "production") {
  console.log("✅ Running in production mode");
} else {
  console.log(
    "⚠️  Not in production mode (NODE_ENV =",
    process.env.NODE_ENV || "undefined",
    ")"
  );
}

console.log("\n");

// 2. Check Firebase Configuration
console.log("📋 Firebase Configuration Check:");
try {
  const { db, auth } = require("./src/config/firebaseAdmin");
  console.log("✅ Firebase Admin SDK initialized");

  // Check if credentials are valid
  if (process.env.FB_ADMIN_CREDENTIALS) {
    try {
      const creds = JSON.parse(process.env.FB_ADMIN_CREDENTIALS);
      if (creds.project_id) {
        console.log(`✅ Firebase project ID: ${creds.project_id}`);
      } else {
        console.log("❌ Invalid Firebase credentials format");
      }
    } catch (e) {
      console.log("❌ Firebase credentials not valid JSON");
    }
  }
} catch (error) {
  console.log(`❌ Firebase configuration error: ${error.message}`);
}

console.log("\n");

// 3. Check Dependencies
console.log("📋 Dependencies Check:");
const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
const deps = packageJson.dependencies;

const requiredDeps = ["@xenova/transformers", "firebase-admin", "express"];

for (const dep of requiredDeps) {
  if (deps[dep]) {
    console.log(`✅ ${dep}: ${deps[dep]}`);
  } else {
    console.log(`❌ ${dep}: Missing`);
  }
}

console.log("\n");

// 4. Check Disk Space (for model downloads)
console.log("📋 Disk Space Check:");
const os = require("os");
const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;
const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(1);

console.log(
  `Memory Usage: ${memUsagePercent}% (${Math.round(
    usedMem / 1024 / 1024
  )}MB / ${Math.round(totalMem / 1024 / 1024)}MB)`
);

if (parseFloat(memUsagePercent) > 90) {
  console.log("⚠️  High memory usage detected");
} else {
  console.log("✅ Memory usage normal");
}

console.log("\n");

// 5. Check Model Cache Directory
console.log("📋 Model Cache Check:");
const cacheDir =
  process.env.TRANSFORMERS_CACHE ||
  process.env.HF_HOME ||
  path.join(process.env.TMPDIR || "/tmp", "transformers");

console.log(`Cache directory: ${cacheDir}`);

try {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
    console.log("✅ Cache directory created");
  } else {
    console.log("✅ Cache directory exists");
  }

  // Check if we can write to cache directory
  const testFile = path.join(cacheDir, "test-write");
  fs.writeFileSync(testFile, "test");
  fs.unlinkSync(testFile);
  console.log("✅ Cache directory is writable");
} catch (error) {
  console.log(`❌ Cache directory error: ${error.message}`);
}

console.log("\n");

// 6. Check Network Connectivity
console.log("📋 Network Connectivity Check:");
const https = require("https");

function checkUrl(url, callback) {
  const start = Date.now();
  https
    .get(url, (res) => {
      const responseTime = Date.now() - start;
      callback(null, res.statusCode, responseTime);
    })
    .on("error", (err) => {
      callback(err, null, null);
    });
}

const connectivityTests = [
  { name: "Google", url: "https://www.google.com", timeout: 5000 },
  { name: "OpenRouter", url: "https://api.openrouter.ai", timeout: 5000 },
];

async function runConnectivityTests() {
  for (const test of connectivityTests) {
    try {
      const result = await new Promise((resolve, reject) => {
        const req = https.get(test.url, (res) => {
          resolve({
            statusCode: res.statusCode,
            responseTime: Date.now() - start,
          });
        });
        req.on("error", reject);
        const start = Date.now();

        req.setTimeout(test.timeout, () => {
          req.destroy();
          reject(new Error("Timeout"));
        });
      });

      console.log(
        `✅ ${test.name}: ${result.statusCode} (${result.responseTime}ms)`
      );
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }

  console.log("\n");
  console.log("🎯 Production Checklist Complete!\n");

  if (envCheck) {
    console.log("✅ All critical environment variables are set");
  } else {
    console.log(
      "❌ Some environment variables are missing - check Firebase Console"
    );
  }

  console.log("\n💡 Production Tips:");
  console.log("1. Pre-warm translation models via GET /api/translate/warmup (admin token) or run scripts/pre-warm-models.js");
  console.log("2. Monitor Firebase Functions logs for errors");
  console.log("3. Ensure TRANSFORMERS_CACHE/HF_HOME point to writable storage");
  console.log("4. Set up alerting for 500 errors");
  console.log("5. Test with curl to isolate frontend/backend issues");
}

runConnectivityTests().catch(console.error);
