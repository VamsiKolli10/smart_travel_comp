const express = require("express");
const request = require("supertest");
const crypto = require("crypto");
const { validateRequestSignature } = require("../src/utils/security");

function sign({ method, path, body, timestamp, secret }) {
  const payload = `${method}:${path}:${JSON.stringify(body || {})}:${timestamp}`;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

describe("Request signing for DELETE", () => {
  const secret = process.env.REQUEST_SIGNING_SECRET || "test-signing-secret";
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(
      validateRequestSignature({
        secret,
        methods: ["DELETE"],
        protectedPaths: ["/secured"],
      })
    );
    app.delete("/secured/:id", (_req, res) => res.json({ ok: true }));
  });

  test("rejects unsigned delete", async () => {
    const res = await request(app).delete("/secured/1").send({});
    expect(res.statusCode).toBe(401);
  });

  test("accepts signed delete", async () => {
    const timestamp = Date.now().toString();
    const sig = sign({
      method: "DELETE",
      path: "/secured/1",
      body: {},
      timestamp,
      secret,
    });

    const res = await request(app)
      .delete("/secured/1")
      .set("x-timestamp", timestamp)
      .set("x-request-signature", sig)
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
