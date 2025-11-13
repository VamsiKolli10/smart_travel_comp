const functions = require("firebase-functions/v1");
const {createApp} = require("./src/app");

const app = createApp();
const region = process.env.FUNCTION_REGION || "us-central1";
const memory = process.env.FUNCTION_MEMORY || "1GB";
const timeoutSeconds = Number(process.env.FUNCTION_TIMEOUT || 60);
const minInstances = Number(process.env.FUNCTION_MIN_INSTANCES || 0);
const maxInstances = Number(process.env.FUNCTION_MAX_INSTANCES || 10);

exports.api = functions
  .region(region)
  .runWith({
    memory,
    timeoutSeconds,
    minInstances,
    maxInstances,
  })
  .https.onRequest(app);
