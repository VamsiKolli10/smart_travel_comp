const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let cachedCredentials;

function loadServiceAccount() {
  if (cachedCredentials) return cachedCredentials;

  const inline =
    process.env.FB_ADMIN_CREDENTIALS || process.env.FIREBASE_ADMIN_CREDENTIALS;
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!inline && !credentialsPath) {
    throw new Error(
      "Missing FB_ADMIN_CREDENTIALS (formerly FIREBASE_ADMIN_CREDENTIALS). Provide a base64 encoded service account JSON via environment variables or set GOOGLE_APPLICATION_CREDENTIALS to a readable file."
    );
  }

  try {
    let jsonString;

    if (inline) {
      jsonString = inline.trim().startsWith("{")
        ? inline
        : Buffer.from(inline, "base64").toString("utf8");
    } else {
      const resolvedPath = path.isAbsolute(credentialsPath)
        ? credentialsPath
        : path.resolve(process.cwd(), credentialsPath);
      jsonString = fs.readFileSync(resolvedPath, "utf8");
    }

    cachedCredentials = JSON.parse(jsonString);

    if (!cachedCredentials.project_id) {
      throw new Error("Service account credentials are missing project_id");
    }

    return cachedCredentials;
  } catch (err) {
    throw new Error(
      `Unable to load Firebase Admin credentials: ${err.message}`
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
