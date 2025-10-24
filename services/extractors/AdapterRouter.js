/**
 * Adapter Router
 * Routes extraction requests to the appropriate site-specific adapter
 * Replaces: StructureExtractorController + PromptController
 */
const AdapterRouter = (function () {
  /**
   * Extract quiz structure - routes to appropriate adapter
   * @param {Object} domData - {url, cleanedHTML, timestamp}
   * @param {Object} aiService - GeminiService instance
   * @returns {Promise<Object>} Quiz structure
   */
  async function extract(domData, aiService, siteType) {
    console.log("[AdapterRouter] Detected site type:", siteType);

    // Route to appropriate adapter
    switch (siteType) {
      case "googleForms":
        return await extractGoogleForms(domData, aiService);

      case "canvas":
        return await extractCanvas(domData, aiService);

      case "moodle":
        return await extractMoodle(domData, aiService);

      default:
        return await extractGeneric(domData, aiService);
    }
  }

  /**
   * Extract Google Forms - try manual first, fallback to AI
   */
  async function extractGoogleForms(domData, aiService) {
    // Try manual extraction first
    try {
      console.log("[AdapterRouter] Trying manual Google Forms extraction...");
      const structure = await window.GoogleFormsExtractor.extractStructure(domData.cleanedHTML, domData.url);

      if (structure && structure.questions && structure.questions.length > 0) {
        console.log("[AdapterRouter] ✅ Manual extraction succeeded!");
        return structure;
      }

      console.warn("[AdapterRouter] Manual extraction returned 0 questions, trying AI...");
    } catch (error) {
      console.warn("[AdapterRouter] Manual extraction failed:", error.message);
      console.log("[AdapterRouter] Falling back to AI...");
    }

    // Fallback to AI with Google Forms prompt
    return await extractWithAI(domData, aiService, window.GoogleFormsPrompt);
  }

  /**
   * Extract Canvas - try manual first, fallback to AI
   */
  async function extractCanvas(domData, aiService) {
    // Try manual extraction first (currently returns null - placeholder)
    try {
      console.log("[AdapterRouter] Trying manual Canvas extraction...");
      const structure = await window.CanvasExtractor.extractStructure(domData.cleanedHTML, domData.url);

      if (structure && structure.questions && structure.questions.length > 0) {
        console.log("[AdapterRouter] ✅ Manual extraction succeeded!");
        return structure;
      }

      console.log("[AdapterRouter] Manual extraction not available, using AI...");
    } catch (error) {
      console.warn("[AdapterRouter] Manual extraction failed:", error.message);
      console.log("[AdapterRouter] Falling back to AI...");
    }

    // Fallback to AI with Canvas prompt
    return await extractWithAI(domData, aiService, window.CanvasPrompt);
  }

  /**
   * Extract Moodle - AI only (no manual extractor yet)
   */
  async function extractMoodle(domData, aiService) {
    console.log("[AdapterRouter] Using AI extraction for Moodle...");
    // TODO: Create MoodlePrompt when we have examples
    // For now, use generic prompt
    return await extractWithAI(domData, aiService, window.GenericPrompt);
  }

  /**
   * Extract Generic - AI only
   */
  async function extractGeneric(domData, aiService) {
    console.log("[AdapterRouter] Using AI extraction (generic site)");
    return await window.GenericExtractor.extractStructure(domData.cleanedHTML, domData.url, aiService);
  }

  /**
   * Extract using AI with site-specific prompt
   * @param {Object} domData - DOM data
   * @param {Object} aiService - AI service
   * @param {Object} promptTemplate - Prompt template object with build() method
   */
  async function extractWithAI(domData, aiService, promptTemplate) {
    const prompt = promptTemplate.build(domData.cleanedHTML, domData.url);

    const response = await aiService.query(prompt, {
      temperature: 0.1,
      maxTokens: 40002,
    });

    // Clean and parse response
    let cleaned = response
      .trim()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const structure = JSON.parse(cleaned);

    // Validate
    if (!structure?.questions || !Array.isArray(structure.questions)) {
      throw new Error("Invalid structure: missing questions array");
    }

    if (structure.questions.length === 0) {
      throw new Error("No questions found in structure");
    }

    console.log("[AdapterRouter] ✅ AI extraction succeeded with", structure.questions.length, "questions");
    return structure;
  }

  // Public API
  return {
    extract,
  };
})();

// Expose globally
window.AdapterRouter = AdapterRouter;
