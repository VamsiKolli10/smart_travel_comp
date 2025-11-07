const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const DEFAULT_SERVICE_ACCOUNT_PATH = path.resolve(
  __dirname,
  "../../serviceAccountKey.json"
);

let cachedCredentials;

function loadServiceAccount() {
  if (cachedCredentials) return cachedCredentials;

  const inline = process.env.FIREBASE_ADMIN_CREDENTIALS;
  if (inline) {
    try {
      const jsonString = inline.trim().startsWith("{")
        ? inline
        : Buffer.from(inline, "base64").toString("utf8");
      cachedCredentials = JSON.parse(jsonString);
      return cachedCredentials;
    } catch (err) {
      throw new Error(
        "Failed to parse FIREBASE_ADMIN_CREDENTIALS. Ensure it is valid JSON or base64 encoded JSON."
      );
    }
  }

  const credentialsPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS || DEFAULT_SERVICE_ACCOUNT_PATH;

  try {
    const resolved = path.resolve(credentialsPath);
    const fileContents = fs.readFileSync(resolved, "utf8");
    cachedCredentials = JSON.parse(fileContents);
    return cachedCredentials;
  } catch (err) {
    throw new Error(
      `Unable to read Firebase admin credentials at ${credentialsPath}: ${err.message}`
    );
  }
}

// Initialize Firebase Admin SDK exactly once
if (!admin.apps.length) {
  const serviceAccount = loadServiceAccount();
  const projectId = serviceAccount.project_id;

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId,
    databaseURL: `https://${projectId}.firebaseio.com`,
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = {
  admin,
  db,
  auth,
  loadServiceAccount,
};
