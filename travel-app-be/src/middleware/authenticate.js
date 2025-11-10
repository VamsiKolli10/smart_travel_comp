const { auth: adminAuth } = require("../config/firebaseAdmin");
const {
  createErrorResponse,
  ERROR_CODES,
  logError,
} = require("../utils/errorHandler");
const { generateRequestFingerprint } = require("../utils/security");

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
  const { allowRoles = ["user", "admin"], onUnauthorized = null } = options;

  return async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json(
          createErrorResponse(
            401,
            ERROR_CODES.UNAUTHORIZED,
            "Missing or invalid Authorization header"
          )
        );
    }

    try {
      const token = authHeader.slice("Bearer ".length);
      const decoded = await adminAuth.verifyIdToken(token);
      const roles = extractRoles(decoded);

      // Check for token expiration
      if (decoded.exp * 1000 < Date.now()) {
        logError(new Error("Token expired"), {
          user: decoded.uid,
          tokenId: decoded.jti,
          fingerprint: generateRequestFingerprint(req),
        });
        return res
          .status(401)
          .json(
            createErrorResponse(
              401,
              ERROR_CODES.UNAUTHORIZED,
              "Token has expired"
            )
          );
      }

      // Check for token revocation
      if (decoded.revoked === true) {
        logError(new Error("Token revoked"), {
          user: decoded.uid,
          tokenId: decoded.jti,
          fingerprint: generateRequestFingerprint(req),
        });
        return res
          .status(401)
          .json(
            createErrorResponse(
              401,
              ERROR_CODES.UNAUTHORIZED,
              "Token has been revoked"
            )
          );
      }

      const allowed = roles.some((role) => allowRoles.includes(role));
      if (!allowed) {
        logError(new Error("Insufficient role"), {
          user: decoded.uid,
          roles: roles,
          requiredRoles: allowRoles,
          fingerprint: generateRequestFingerprint(req),
        });

        if (typeof onUnauthorized === "function") {
          return onUnauthorized(req, res);
        }
        return res
          .status(403)
          .json(
            createErrorResponse(
              403,
              ERROR_CODES.FORBIDDEN,
              "Forbidden: insufficient role"
            )
          );
      }

      // Add additional security checks
      // Check if the token is being used from the same IP that it was issued to (if IP is included in token)
      if (decoded.ip && decoded.ip !== req.ip) {
        logError(new Error("Token IP mismatch"), {
          user: decoded.uid,
          tokenIp: decoded.ip,
          requestIp: req.ip,
          fingerprint: generateRequestFingerprint(req),
        });
        return res
          .status(401)
          .json(
            createErrorResponse(
              401,
              ERROR_CODES.UNAUTHORIZED,
              "Token is not valid for this IP address"
            )
          );
      }

      // Set user information
      req.user = decoded;
      req.userRoles = roles;
      req.userId = decoded.uid;

      // Create a security context for this request
      req.securityContext = {
        ...req.securityContext,
        authenticated: true,
        userId: decoded.uid,
        tokenId: decoded.jti,
        roles: roles,
        fingerprint: generateRequestFingerprint(req),
        timestamp: Date.now(),
      };

      next();
    } catch (err) {
      logError(err, {
        message: "Token verification error",
        ip: req.ip,
        fingerprint: generateRequestFingerprint(req),
      });
      res
        .status(401)
        .json(
          createErrorResponse(401, ERROR_CODES.UNAUTHORIZED, "Unauthorized")
        );
    }
  };
}

module.exports = { requireAuth };
