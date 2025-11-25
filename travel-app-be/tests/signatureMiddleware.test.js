const express = require("express");
const request = require("supertest");
const crypto = require("crypto");
const { validateRequestSignature } = require("../src/utils/security");

function sign({ method, path, body, timestamp, secret }) {
  const payload = `${method}:${path}:${JSON.stringify(body || {})}:${timestamp}`;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

describe("Request signature middleware", () => {
  const secret = process.env.REQUEST_SIGNING_SECRET || "test-signing-secret";
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(
      validateRequestSignature({
        secret,
        methods: ["POST"],
        protectedPaths: ["/protected"],
      })
    );
    app.post("/protected", (_req, res) => res.json({ ok: true }));
  });

  test("rejects unsigned request", async () => {
    const res = await request(app).post("/protected").send({ foo: "bar" });
    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  test("accepts signed request", async () => {
    const timestamp = Date.now().toString();
    const sig = sign({
      method: "POST",
      path: "/protected",
      body: { foo: "bar" },
      timestamp,
      secret,
    });

    const res = await request(app)
      .post("/protected")
      .set("x-timestamp", timestamp)
      .set("x-request-signature", sig)
      .send({ foo: "bar" });

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
