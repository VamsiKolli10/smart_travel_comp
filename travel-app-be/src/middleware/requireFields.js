function requireFields(required = []) {
    return function (req, res, next) {
      const missing = required.filter(k => {
        const v = req.body?.[k];
        return v === undefined || v === null || (typeof v === "string" && v.trim() === "");
      });
      if (missing.length) {
        return res.status(400).json({ error: "Missing required fields", missing });
      }
      next();
    };
  }
  
  module.exports = { requireFields };
  