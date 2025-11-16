const admin = require("firebase-admin");

let cachedCredentials;

function loadServiceAccount() {
  if (cachedCredentials) return cachedCredentials;

  const inline = process.env.FIREBASE_ADMIN_CREDENTIALS;
  if (!inline) {
    throw new Error(
      "Missing FIREBASE_ADMIN_CREDENTIALS. Provide a base64 encoded service account JSON via environment variables."
    );
  }

  try {
    const jsonString = inline.trim().startsWith("{")
      ? inline
      : Buffer.from(inline, "base64").toString("utf8");
    cachedCredentials = JSON.parse(jsonString);

    if (!cachedCredentials.project_id) {
      throw new Error("Service account credentials are missing project_id");
    }

    return cachedCredentials;
  } catch (err) {
    throw new Error(
      `Unable to parse FIREBASE_ADMIN_CREDENTIALS: ${err.message}`
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
