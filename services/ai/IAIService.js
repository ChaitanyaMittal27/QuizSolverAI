/**
 * IAIService - AI Service Interface
 * Abstract interface for AI services
 * Currently using gemini flash in ai/GeminiService.js
 */
class IAIService {
  /**
   * Send a prompt to the AI and get a response
   * @param {string} prompt - The prompt to send
   * @param {Object} options - Additional options
   * @returns {Promise<string>} AI response
   */
  async query(prompt, options = {}) {
    throw new Error("IAIService.query() not implemented");
  }

  /**
   * Check if the service is configured and ready
   * @returns {Promise<boolean>}
   */
  async isReady() {
    throw new Error("IAIService.isReady() not implemented");
  }
}

// Make globally available
window.IAIService = IAIService;
