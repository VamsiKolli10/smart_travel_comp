const admin = require("firebase-admin");
const path = require("path");

const serviceAccountPath = path.resolve(__dirname, "serviceAccountKey.json");
const serviceAccount = require(serviceAccountPath);
const UID = process.argv[2] || "jzj2TECcxNf3aFdn8ySlqdoSgXG3";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

admin
  .auth()
  .updateUser(UID, { emailVerified: true })
  .then(() => {
    console.log(`Marked ${UID} as verified.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to update user:", err);
    process.exit(1);
  });
