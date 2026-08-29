const crypto = require("crypto");

function requestContext(req, res, next) {
  const incoming = req.headers["x-request-id"];
  req.requestId =
    typeof incoming === "string" && /^[a-zA-Z0-9._-]{8,128}$/.test(incoming)
      ? incoming
      : crypto.randomUUID();
  res.setHeader("X-Request-ID", req.requestId);

  const startedAt = Date.now();
  res.on("finish", () => {
    console.log(
      JSON.stringify({
        level: "info",
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Date.now() - startedAt,
        authenticated: Boolean(req.user),
      })
    );
  });
  next();
}

module.exports = { requestContext };
