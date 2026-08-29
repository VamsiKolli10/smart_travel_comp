const express = require("express");
const request = require("supertest");
const crypto = require("crypto");
const { validateRequestSignature } = require("../src/utils/security");

function sign({ method, path, body, timestamp, secret }) {
  const payload = `${method}:${path}:${JSON.stringify(body || {})}:${timestamp}`;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

describe("Request signing for PUT", () => {
  const secret = process.env.REQUEST_SIGNING_SECRET || "test-signing-secret";
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(
      validateRequestSignature({
        secret,
        methods: ["PUT"],
        protectedPaths: ["/secured"],
      })
    );
    app.put("/secured/:id", (_req, res) => res.json({ ok: true }));
  });

  test("rejects unsigned put", async () => {
    const res = await request(app).put("/secured/1").send({ name: "test" });
    expect(res.statusCode).toBe(401);
  });

  test("accepts signed put", async () => {
    const timestamp = Date.now().toString();
    const sig = sign({
      method: "PUT",
      path: "/secured/1",
      body: { name: "test" },
      timestamp,
      secret,
    });

    const res = await request(app)
      .put("/secured/1")
      .set("x-timestamp", timestamp)
      .set("x-request-signature", sig)
      .send({ name: "test" });

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
