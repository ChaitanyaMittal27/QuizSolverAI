/**
 * StructureExtractorController - Intelligent extractor selection
 * Handles manual extraction with AI fallback internally
 */
const StructureExtractorController = (function () {
  const SITE_PATTERNS = {
    canvas: /canvas\./i,
    googleForms: /docs\.google\.com\/forms/i,
    moodle: /moodle\./i,
  };

  /**
   * Detect site type from URL
   */
  function detectSite(url) {
    if (SITE_PATTERNS.canvas.test(url)) return "canvas";
    if (SITE_PATTERNS.googleForms.test(url)) return "googleForms";
    if (SITE_PATTERNS.moodle.test(url)) return "moodle";
    return "generic";
  }

  /**
   * Extract quiz structure - handles everything internally
   * @param {Object} domData - {url, title, cleanedHTML, timestamp}
   * @param {Object} aiService - GeminiService instance
   * @returns {Promise<Object>} Quiz structure
   */
  async function extract(domData, aiService) {
    const siteType = detectSite(domData.url);
    console.log("[ExtractorController] Detected site type:", siteType);

    // Strategy: Try manual first, fallback to AI

    // === GOOGLE FORMS ===
    if (siteType === "googleForms") {
      // Try manual extraction first
      try {
        console.log("[ExtractorController] Trying manual Google Forms extraction...");
        const structure = await window.GoogleFormsExtractor.extractStructure(domData.cleanedHTML, domData.url);

        if (structure.questions.length > 0) {
          console.log("[ExtractorController] ✅ Manual extraction succeeded!");
          return structure;
        }
      } catch (error) {
        console.warn("[ExtractorController] Manual extraction failed:", error.message);
        console.log("[ExtractorController] Falling back to AI...");
      }
      // Fallback to AI
      return await window.AIStructureExtractor.extractStructure(domData.cleanedHTML, domData.url, aiService);
    }

    // === CANVAS ===
    if (siteType === "canvas") {
      // Could add manual Canvas extractor here later
      // For now, use AI with Canvas-specific prompt
      console.log("[ExtractorController] Using AI extractor with Canvas prompt");
      return await window.AIStructureExtractor.extractStructure(domData.cleanedHTML, domData.url, aiService);
    }

    // === GENERIC / UNKNOWN ===
    console.log("[ExtractorController] Using AI extractor (generic)");
    return await window.AIStructureExtractor.extractStructure(domData.cleanedHTML, domData.url, aiService);
  }

  return {
    detectSite,
    extract,
  };
})();

window.StructureExtractorController = StructureExtractorController;
