/**
 * GeminiService - Google Gemini API Implementation
 * Handles communication with Google's Gemini API
 */
class GeminiService extends IAIService {
  constructor() {
    super();
    this.apiKey = null;
    this.endpoint = window.QUIZ_SOLVER_CONFIG.GEMINI_API_ENDPOINT;
  }

  /**
   * Initialize service - load API key
   */
  async initialize() {
    this.apiKey = window.QUIZ_SOLVER_CONFIG.GEMINI_API_KEY; // For now, get from CONFIG (hardcoded)
    if (!this.apiKey) {
      throw new Error("Gemini API key not configured");
    }
    console.log("[GeminiService] Initialized with API key"); // DEBUG log
  }

  /**
   * Check if service is ready to use
   * @returns {Promise<boolean>}
   */
  async isReady() {
    return this.apiKey !== null && this.apiKey !== "";
  }

  /**
   * Send query to Gemini API
   * @param {string} prompt - The prompt to send
   * @param {Object} options - Additional options
   * @returns {Promise<string>} AI response text
   */
  async query(prompt, options = {}) {
    if (!this.apiKey) {
      throw new Error("GeminiService not initialized. Call initialize() first.");
    }
    // console.log("[GeminiService] 🤖 Sending query to Gemini..."); // DEBUG
    // console.log("[GeminiService] Prompt length:", prompt.length, "characters"); // DEBUG
    try {
      const url = `${this.endpoint}?key=${this.apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxTokens || 2048,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      const data = await response.json();
      // verification
      // Check if response has expected structure
      if (!data.candidates || !data.candidates[0]) {
        console.error("[GeminiService] Unexpected response structure:", data);

        // Check for API error message
        if (data.error) {
          throw new Error(`Gemini API error: ${data.error.message}`);
        }

        throw new Error("Gemini returned no candidates. Response: " + JSON.stringify(data));
      }
      // Check if content exists
      if (!data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        console.error("[GeminiService] Invalid candidate structure:", data.candidates[0]);
        throw new Error("Gemini response missing content/parts");
      }

      const text = data.candidates[0].content.parts[0].text;
      if (!text) {
        throw new Error("Gemini returned empty text response");
      }
      // console.log("[GeminiService] ✅ Response received"); // DEBUG log
      // console.log("[GeminiService] Response length:", text.length, "characters"); // DEBUG log
      return text;
    } catch (error) {
      console.error("[GeminiService] ❌ API call failed:", error);
      throw error;
    }
  }
}

window.GeminiService = GeminiService; // Make globally available
