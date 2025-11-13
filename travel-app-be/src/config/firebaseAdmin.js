const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const DEFAULT_SERVICE_ACCOUNT_PATH = path.join(
  PROJECT_ROOT,
  "serviceAccountKey.json"
);

const INLINE_CREDENTIAL_ENV_KEYS = [
  "SERVICE_ACCOUNT_CREDENTIALS",
  "ADMIN_SERVICE_ACCOUNT",
  "FIREBASE_ADMIN_CREDENTIALS",
];

let cachedCredentials;

function loadServiceAccount() {
  if (cachedCredentials) return cachedCredentials;

  const inlineSourceKey = INLINE_CREDENTIAL_ENV_KEYS.find(
    (key) => !!process.env[key]
  );
  const inline = inlineSourceKey ? process.env[inlineSourceKey] : null;

  if (inline) {
    try {
      const jsonString = inline.trim().startsWith("{")
        ? inline
        : Buffer.from(inline, "base64").toString("utf8");
      cachedCredentials = JSON.parse(jsonString);
      return cachedCredentials;
    } catch (err) {
      throw new Error(
        `Failed to parse ${inlineSourceKey}. Ensure it is valid JSON or base64 encoded JSON.`
      );
    }
  }

  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const credentialsPath =
    envPath && path.isAbsolute(envPath)
      ? envPath
      : envPath
      ? path.resolve(PROJECT_ROOT, envPath)
      : DEFAULT_SERVICE_ACCOUNT_PATH;
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
