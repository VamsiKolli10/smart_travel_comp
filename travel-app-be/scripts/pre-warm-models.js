#!/usr/bin/env node
/**
 * Pre-warm translation models after deployment
 * Run: node scripts/pre-warm-models.js
 */

require("dotenv").config();

const axios = require("axios");

const API_BASE = process.env.VITE_API_URL || "http://localhost:8000/api";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "test-admin-token";

console.log("🚀 Pre-warming Translation Models\n");
console.log(`API Base URL: ${API_BASE}\n`);

const SUPPORTED_PAIRS = [
  "en-es",
  "en-fr",
  "en-de",
  "es-en",
  "es-fr",
  "es-de",
  "fr-en",
  "fr-es",
  "fr-de",
  "de-en",
  "de-es",
  "de-fr",
];

async function warmModels() {
  console.log("🔥 Starting model pre-warming...\n");

  try {
    const response = await axios.get(
      `${API_BASE}/translate/warmup?pairs=${SUPPORTED_PAIRS.join(",")}`,
      {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 120000, // 2 minutes timeout for all models
      }
    );

    console.log("✅ Warmup completed!");
    console.log(`   Warmed: ${JSON.stringify(response.data.warmed)}`);
    console.log(`   Failed: ${JSON.stringify(response.data.failed)}`);
    console.log(`   Total requested: ${response.data.totalRequested}`);
    console.log(`   Total warmed: ${response.data.totalWarmed}`);

    if (response.data.failed && response.data.failed.length > 0) {
      console.log("\n⚠️  Some models failed to warm up:");
      response.data.failed.forEach((failure) => {
        console.log(`   - ${failure.pair}: ${failure.error}`);
      });
    }
  } catch (error) {
    if (error.response) {
      console.log(`❌ Warmup failed with status ${error.response.status}`);
      console.log(`   Error: ${JSON.stringify(error.response.data)}`);
    } else {
      console.log(`❌ Warmup failed: ${error.message}`);
    }
  }
}

async function checkHealth() {
  console.log("\n🏥 Checking translation service health...\n");

  try {
    const response = await axios.get(`${API_BASE}/translate/health`, {
      timeout: 10000,
    });

    console.log(`✅ Health check passed! Status: ${response.data.status}`);
    console.log(`   Models loaded: ${response.data.models.loaded.join(", ")}`);
    console.log(`   Total models: ${response.data.models.total}`);
    console.log(
      `   Memory usage: ${Math.round(
        response.data.environment.memoryUsage.heapUsed / 1024 / 1024
      )}MB`
    );

    if (response.data.warning) {
      console.log(`   ⚠️  Warning: ${response.data.warning}`);
    }
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
  }
}

async function testTranslation() {
  console.log("\n🧪 Testing translation functionality...\n");

  const testCases = [
    { text: "Hello", langPair: "en-es" },
    { text: "How are you?", langPair: "en-fr" },
  ];

  for (const testCase of testCases) {
    try {
      const response = await axios.post(
        `${API_BASE}/translate`,
        {
          text: testCase.text,
          langPair: testCase.langPair,
        },
        {
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log(
        `✅ ${testCase.text} (${testCase.langPair}) -> "${response.data.translation}"`
      );
    } catch (error) {
      console.log(
        `❌ ${testCase.text} (${testCase.langPair}) failed: ${error.message}`
      );
    }
  }
}

async function main() {
  await warmModels();
  await checkHealth();
  await testTranslation();

  console.log("\n🎯 Pre-warming complete!\n");
  console.log("💡 Tips:");
  console.log("1. Monitor Firebase Functions logs for any errors");
  console.log("2. Check that all models loaded successfully");
  console.log("3. Test translation functionality in your app");
  console.log("4. Set up alerts for 500 errors");
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { warmModels, checkHealth, testTranslation };
