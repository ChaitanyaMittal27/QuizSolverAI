/**
 * AI Answer Generator
 * Generates correct answers for quiz questions using AI
 */
const AIAnswerGenerator = (function () {
  /**
   * Generate answers for quiz questions
   * @param {Object} quizStructure - Quiz structure from extraction phase
   * @param {Object} aiService - AI service (GeminiService)
   * @param {string} siteType - Site type (canvas, googleForms)
   * @returns {Promise<Object>} Answer instructions
   */
  async function generateAnswers(quizStructure, aiService, siteType) {
    console.log("[AnswerGenerator] 🧠 Generating answers...");
    console.log("[AnswerGenerator] Questions to solve:", quizStructure.questions.length);

    try {
      // 1. Get full prompt from platform-specific function
      const prompt = selectPrompt(siteType, quizStructure);

      // 2. Send to AI
      const response = await aiService.query(prompt, {
        temperature: 0.3,
        maxTokens: 40002,
      });

      // 3. Clean & parse JSON
      let cleaned = response
        .trim()
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      let answerInstructions = JSON.parse(cleaned);

      // Fix: AI sometimes returns array [...] directly instead of {answers: [...]}
      if (Array.isArray(answerInstructions)) {
        answerInstructions = { answers: answerInstructions };
      }

      // 4. Validate
      if (!answerInstructions?.answers || !Array.isArray(answerInstructions.answers)) {
        throw new Error("Invalid answer structure");
      }

      if (answerInstructions.answers.length === 0) {
        throw new Error("No answers generated");
      }

      console.log("[AnswerGenerator] ✅ Answers generated successfully");
      console.log("[AnswerGenerator] Generated answers:", answerInstructions);
      return answerInstructions;
    } catch (error) {
      console.error("[AnswerGenerator] ❌ Failed:", error.message);
      throw error;
    }
  }

  /**
   * Select siteType-specific prompt (with data included)
   * @param {string} siteType - Site type
   * @param {Object} quizStructure - Quiz structure with questions
   * @returns {string} Complete prompt ready for AI
   */
  function selectPrompt(siteType, quizStructure) {
    switch (siteType) {
      case "canvas":
        if (!window.CanvasAnsGenPrompt) {
          throw new Error("CanvasAnsGenPrompt not loaded");
        }
        return window.CanvasAnsGenPrompt(quizStructure);

      case "googleForms":
        if (!window.GoogleFormsAnsGenPrompt) {
          throw new Error("GoogleFormsAnsGenPrompt not loaded");
        }
        return window.GoogleFormsAnsGenPrompt(quizStructure);

      case "coursys":
        if (!window.CoursysAnsGenPrompt) {
          throw new Error("CoursysAnsGenPrompt not loaded");
        }
        return window.CoursysAnsGenPrompt(quizStructure);

      case "moodle": // Fallback to generic for moodle until we have specific prompt
        if (!window.GenericAnsGenPrompt) {
          throw new Error("GenericAnsGenPrompt not loaded");
        }
        return window.GenericAnsGenPrompt(quizStructure);

      default:
        console.warn(`[AnswerGenerator] Unknown siteType: ${siteType}, using generic`);
        if (!window.GenericAnsGenPrompt) {
          throw new Error("GenericAnsGenPrompt not loaded");
        }
        return window.GenericAnsGenPrompt(quizStructure);
    }
  }

  return {
    generateAnswers,
  };
})();

// Expose globally
window.AIAnswerGenerator = AIAnswerGenerator;
