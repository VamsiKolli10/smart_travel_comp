const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Add CORS support
const cors = require("cors");

// Global options for all functions
setGlobalOptions({maxInstances: 10});

// Simple HTTP test function with CORS
exports.helloWorld = onRequest((req, res) => {
  // Enable CORS for all origins (adjust as needed)
  cors({origin: true})(req, res, () => {
    logger.info("HelloWorld function invoked", {structuredData: true});
    res.send("Hello from Firebase!");
  });
});
