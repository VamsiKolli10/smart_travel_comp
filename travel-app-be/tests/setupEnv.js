const fakeServiceAccount = {
  project_id: "demo-project",
  client_email: "demo@demo.iam.gserviceaccount.com",
  private_key: "-----BEGIN PRIVATE KEY-----\\nFAKEKEY\\n-----END PRIVATE KEY-----\\n",
};

process.env.REQUEST_SIGNING_SECRET =
  process.env.REQUEST_SIGNING_SECRET || "test-signing-secret";
process.env.FB_ADMIN_CREDENTIALS =
  process.env.FB_ADMIN_CREDENTIALS ||
  process.env.FIREBASE_ADMIN_CREDENTIALS ||
  Buffer.from(JSON.stringify(fakeServiceAccount)).toString("base64");
process.env.CORS_ALLOWED_ORIGINS =
  process.env.CORS_ALLOWED_ORIGINS || "http://localhost:5173";

const mockAuth = {
  verifyIdToken: jest.fn(async (token) => {
    if (token === "valid-admin-token") {
      return {
        uid: "admin-user",
        admin: true,
        roles: ["admin"],
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
    }
    if (token === "valid-user-token") {
      return {
        uid: "user-123",
        admin: false,
        roles: ["user"],
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
    }
    const error = new Error("Invalid token");
    error.code = "auth/invalid-token";
    throw error;
  }),
};

const mockSavedPhrasesCollection = {
  orderBy: jest.fn().mockReturnThis(),
  get: jest.fn().mockResolvedValue({ docs: [] }),
  add: jest.fn().mockResolvedValue({ id: "saved-1" }),
};

const mockUserDoc = {
  collection: jest.fn(() => mockSavedPhrasesCollection),
  get: jest.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
  delete: jest.fn().mockResolvedValue(),
};

const mockUsersCollection = {
  limit: jest.fn().mockReturnThis(),
  get: jest.fn().mockResolvedValue({ docs: [] }),
  add: jest.fn().mockResolvedValue({ id: "user-1" }),
  doc: jest.fn(() => mockUserDoc),
};

const mockFirestore = jest.fn(() => ({
  collection: jest.fn(() => mockUsersCollection),
}));
mockFirestore.FieldValue = {
  serverTimestamp: jest.fn(() => new Date()),
};

jest.mock("firebase-admin", () => ({
  apps: [],
  credential: {
    cert: (value) => value,
  },
  initializeApp: jest.fn(),
  firestore: mockFirestore,
  auth: () => mockAuth,
}));
