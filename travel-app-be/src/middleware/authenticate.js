const { auth: adminAuth } = require("../config/firebaseAdmin");

function extractRoles(decodedToken = {}) {
  const roles = new Set();

  if (Array.isArray(decodedToken.roles)) {
    decodedToken.roles.forEach((role) => roles.add(role));
  }

  if (Array.isArray(decodedToken.role)) {
    decodedToken.role.forEach((role) => roles.add(role));
  } else if (typeof decodedToken.role === "string") {
    roles.add(decodedToken.role);
  }

  if (decodedToken.admin === true) {
    roles.add("admin");
  }

  if (!roles.size) {
    roles.add("user");
  }

  return Array.from(roles);
}

function requireAuth(options = {}) {
  const {
    allowRoles = ["user", "admin"],
    onUnauthorized = null,
  } = options;

  return async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid Authorization header" });
    }

    try {
      const token = authHeader.slice("Bearer ".length);
      const decoded = await adminAuth.verifyIdToken(token);
      const roles = extractRoles(decoded);

      const allowed = roles.some((role) => allowRoles.includes(role));
      if (!allowed) {
        if (typeof onUnauthorized === "function") {
          return onUnauthorized(req, res);
        }
        return res.status(403).json({ error: "Forbidden: insufficient role" });
      }

      req.user = decoded;
      req.userRoles = roles;
      next();
    } catch (err) {
      console.error("Token verification error:", err?.message || err);
      res.status(401).json({ error: "Unauthorized" });
    }
  };
}

module.exports = { requireAuth };
