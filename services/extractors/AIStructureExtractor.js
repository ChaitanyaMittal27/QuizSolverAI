/**
 * AIStructureExtractor - Extract quiz structure using AI API
 */
const AIStructureExtractor = (function () {
  /**
   * Extract quiz structure from HTML
   * @param {string} html - Cleaned HTML
   * @param {string} url - Page URL
   * @param {Object} aiService - AI service (GeminiService)
   * @returns {Promise<Object>} Quiz structure JSON
   */
  async function extractStructure(html, url, aiService) {
    console.log("[StructureExtractor] 🔍 Extracting structure...");
    console.log("[StructureExtractor] URL:", url);

    try {
      // 1. Get site-specific prompt
      const prompt = window.PromptController.getPrompt(html, url);

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

      /* DEBUG AI API response Question JSON
      console.log("[StructureExtractor] ✅ Success, got results:");
      console.log("[StructureExtractor] Platform:", structure.quizMetadata.platform);
      console.log("[StructureExtractor] Num_Questions:", structure.questions.length);
      structure.questions.forEach((q) => {
        console.log(
          `[StructureExtractor] - QID: ${q.qid}, Type: ${q.question_type}, Text: ${q.question_text.substring(
            0,
            50
          )} ...`
        );
        if (q.options) {
          q.options.forEach((o) => {
            console.log(`[StructureExtractor]   - OID: ${o.oid}, Text: ${o.option_text.substring(0, 50)} ...`);
          });
        }
      });
      */

      // 6. Return the structure
      console.log("[StructureExtractor] ✅ Structure extracted with", structure.questions.length, "questions"); // DEBUG log
      return structure;
    } catch (error) {
      console.error("[StructureExtractor] ❌ Failed:", error.message);
      throw error;
    }
  }

  return { extractStructure };
})();

window.AIStructureExtractor = AIStructureExtractor;
