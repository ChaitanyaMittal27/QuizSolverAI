// Configuration and constants
const CONFIG = {
  // API Configuration
  GEMINI_API_KEY: "", // Insert your Gemini API key here
  GEMINI_API_ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",

  // Keyboard shortcuts
  SHORTCUTS: {
    SOLVE: { ctrl: true, shift: true, key: "Q" },
    UNDO: { ctrl: true, shift: true, key: "E" },
  },

  // Timing
  DELAYS: {
    MIN: 100, // Minimum delay between actions (ms)
    MAX: 500, // Maximum delay between actions (ms)
  },
};

window.QUIZ_SOLVER_CONFIG = CONFIG; // Make it globally available
