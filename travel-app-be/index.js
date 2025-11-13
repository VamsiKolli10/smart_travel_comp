const {setGlobalOptions} = require("firebase-functions/v2/options");
const {onRequest} = require("firebase-functions/v2/https");
const {createApp} = require("./src/app");

// Configure defaults for all deployed functions.
setGlobalOptions({
  region: process.env.FUNCTION_REGION || "us-central1",
  memoryMiB: 1024,
  timeoutSeconds: 60,
  maxInstances: Number(process.env.FUNCTION_MAX_INSTANCES || 20),
  minInstances: Number(process.env.FUNCTION_MIN_INSTANCES || 0),
});

const app = createApp();

// Expose the Express API as a single HTTPS function.
exports.api = onRequest(app);
