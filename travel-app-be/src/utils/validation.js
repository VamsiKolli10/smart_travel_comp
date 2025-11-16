const DEFAULT_TEXT_MAX = Number(process.env.MAX_TRANSLATION_CHARS || 500);
const LANGUAGE_CODE_PATTERN = /^[a-z]{2}(?:-[A-Z]{2})?$/;

function sanitizeString(value, { maxLength = 250, label = "value", allowEmpty = false } = {}) {
  if (value === undefined || value === null) {
    return {
      error: allowEmpty ? null : `${label} is required`,
      value: "",
    };
  }
  const trimmed = String(value).trim();
  if (!trimmed && !allowEmpty) {
    return { error: `${label} cannot be empty`, value: "" };
  }
  if (trimmed.length > maxLength) {
    return {
      error: `${label} exceeds maximum length of ${maxLength} characters`,
      value: trimmed.slice(0, maxLength),
    };
  }
  return { value: trimmed };
}

function sanitizeTextInput(value, options = {}) {
  return sanitizeString(value, {
    maxLength: options.maxLength ?? DEFAULT_TEXT_MAX,
    label: options.label ?? "text",
    allowEmpty: false,
  });
}

function normalizeLangPair(pair, allowedPairs = new Set()) {
  if (!pair || typeof pair !== "string") {
    return { error: "langPair is required" };
  }
  const normalized = pair.toLowerCase().trim();
  if (!normalized.includes("-")) {
    return { error: "langPair must be in the form source-target (e.g., en-es)" };
  }
  if (allowedPairs.size && !allowedPairs.has(normalized)) {
    return { error: `Unsupported langPair: ${normalized}` };
  }
  return { value: normalized };
}

function validateLangCode(code, { label = "language" } = {}) {
  if (!code) return { error: `${label} is required` };
  const normalized = String(code).trim();
  if (!LANGUAGE_CODE_PATTERN.test(normalized)) {
    return {
      error: `${label} must match pattern xx or xx-XX`,
    };
  }
  return { value: normalized };
}

function ensureOwner(req, targetUid) {
  if (!req.user?.uid) {
    return { error: "Unauthorized" };
  }
  if (req.user.uid !== targetUid) {
    return { error: "Forbidden: cannot access resources of another user" };
  }
  return { value: targetUid };
}

module.exports = {
  sanitizeString,
  sanitizeTextInput,
  normalizeLangPair,
  validateLangCode,
  ensureOwner,
  LANGUAGE_CODE_PATTERN,
  DEFAULT_TEXT_MAX,
};
