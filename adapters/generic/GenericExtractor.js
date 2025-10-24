/**
 * Generic AI Extractor
 * AI-based extraction for unknown/generic sites
 * Fallback when no manual extractor exists
 */
const GenericExtractor = (function () {
  /**
   * Extract quiz structure using AI
   * @param {string} html - Cleaned HTML
   * @param {string} url - Page URL
   * @param {Object} aiService - AI service (GeminiService)
   * @returns {Promise<Object>} Quiz structure JSON
   */
  async function extractStructure(html, url, aiService) {
    console.log("[GenericExtractor] 🔍 Starting AI extraction...");
    console.log("[GenericExtractor] URL:", url);

    try {
      // 1. Get generic prompt
      const prompt = window.GenericPrompt.build(html, url);

      // 2. Send to AI
      const response = await aiService.query(prompt, {
        temperature: 0.1,
        maxTokens: 4096,
      });

      // 3. Clean response (remove markdown if present)
      let cleaned = response
        .trim()
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      // 4. Parse JSON
      const structure = JSON.parse(cleaned);

      // 5. Basic validation
      if (!structure?.questions || !Array.isArray(structure.questions)) {
        throw new Error("Invalid structure: missing questions array");
      }

      if (structure.questions.length === 0) {
        throw new Error("No questions found in structure");
      }

      console.log("[GenericExtractor] ✅ Structure extracted with", structure.questions.length, "questions");
      return structure;
    } catch (error) {
      console.error("[GenericExtractor] ❌ Failed:", error.message);
      throw error;
    }
  }

  return {
    extractStructure,
  };
})();

// Expose globally
window.GenericExtractor = GenericExtractor;
