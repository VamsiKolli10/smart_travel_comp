require("dotenv").config();
const { admin, loadServiceAccount } = require("./src/config/firebaseAdmin");

const UID = process.argv[2];
if (!UID) {
  console.error("Usage: node verify-user.js <firebase-uid>");
  process.exit(1);
}

// Force credentials load early so script fails fast when env is missing/malformed.
loadServiceAccount();

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
