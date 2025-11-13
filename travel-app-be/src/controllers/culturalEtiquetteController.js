/**
 * Legacy cultural etiquette controller.
 * This is now a thin compatibility wrapper around the unified Culture Intelligence brief.
 * It proxies /api/cultural-etiquette requests to /api/culture/brief semantics to avoid
 * duplicated logic while keeping old clients working.
 */

const { getBrief } = require("./cultureIntelligenceController");

exports.generateCulturalEtiquette = async (req, res) => {
  try {
    // Map legacy query expectations to new controller:
    // - destination: required
    // - culture, language: optional
    // cultureIntelligenceController.getBrief handles defaults, caching, and validation.
    return getBrief(req, res);
  } catch (error) {
    // In practice, getBrief already handles its own errors via standardized responses.
    // This catch is just a final safeguard.
    logError(error, {
      endpoint: "/api/cultural-etiquette",
      query: req.query,
      note: "Unexpected error in legacy cultural etiquette wrapper",
    });
    return res
      .status(500)
      .json(
        createErrorResponse(
          500,
          ERROR_CODES.INTERNAL_ERROR,
          "Failed to process cultural etiquette request"
        )
      );
  }
};
