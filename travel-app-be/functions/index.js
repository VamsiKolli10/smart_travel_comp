/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Global options for all functions
setGlobalOptions({maxInstances: 10});

// Simple HTTP test function
exports.helloWorld = onRequest((req, res) => {
  logger.info("HelloWorld function invoked", {structuredData: true});
  res.send("Hello from Firebase!");
});
