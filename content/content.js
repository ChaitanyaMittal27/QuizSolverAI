/**
 * Quiz Solver Extension - Main Content Script
 */
(function () {
  "use strict";

  // Get config and init state
  const CONFIG = window.QUIZ_SOLVER_CONFIG;
  let isInitialized = false;
  let geminiService = null;

  /**
   * Initialize Gemini API service
   */
  async function initializeGeminiAPI() {
    try {
      geminiService = new window.GeminiService();
      await geminiService.initialize();
    } catch (error) {
      console.error("[Quiz Solver] ⚠️ Gemini initialization failed:", error);
    }
  }

  /**
   * Initialize the extension
   */
  async function initialize() {
    console.log("[Quiz Solver] Extension loading...");
    if (isInitialized) {
      console.log("[Quiz Solver] Already initialized");
      return;
    }

    // Setup requirements
    setupKeyboardListeners();
    await initializeGeminiAPI();

    // Mark as initialized
    isInitialized = true;
    console.log("[Quiz Solver] Extension loaded successfully! 🚀");
  }

  /**
   * Setup keyboard event listeners
   */
  function setupKeyboardListeners() {
    document.addEventListener("keydown", handleKeyboardShortcut);
    console.log("[Quiz Solver] Keyboard listeners registered");
  }

  /**
   * Handle keyboard shortcuts depending on configuration
   */
  function handleKeyboardShortcut(event) {
    if (isShortcutMatch(event, CONFIG.SHORTCUTS.SOLVE)) {
      event.preventDefault();
      handleSolveTrigger();
      return;
    }
    if (isShortcutMatch(event, CONFIG.SHORTCUTS.UNDO)) {
      event.preventDefault();
      handleUndoTrigger();
      return;
    }
  }

  /**
   * Helper function to check if keyboard event matches shortcut configuration
   */
  function isShortcutMatch(event, shortcut) {
    return event.ctrlKey === shortcut.ctrl && event.shiftKey === shortcut.shift && event.key === shortcut.key;
  }

  /**
   * Handle solve trigger (Ctrl+Shift+Q)
   */
  async function handleSolveTrigger() {
    console.log("[Quiz Solver] 🎯 Solve triggered!");

    try {
      // Phase 1: Extract DOM
      const domManager = new window.DOMManager();
      const domData = domManager.extractCleanHTML();
      console.log("[Quiz Solver] ✓ DOM extracted");

      // Phase 2: Detect site type
      const siteType = window.AdapterRouter.detectSite(domData.url);
      console.log("[Quiz Solver] Detected site:", siteType);

      // Phase 3: Extract structure
      console.log("[Quiz Solver] 🔍 Extracting quiz structure...");
      const quizStructure = await window.AdapterRouter.extract(domData, geminiService);
      console.log("[Quiz Solver] ✅ Structure extracted!");

      // Phase 4: Generate answers
      console.log("[Quiz Solver] 🧠 Generating answers...");
      const answerInstructions = await window.AIAnswerGenerator.generateAnswers(quizStructure, geminiService);
      console.log("[Quiz Solver] ✅ Answers generated!");

      // Phase 5: Apply answers (CHANGED - now uses ApplicatorRouter)
      console.log("[Quiz Solver] ✍️ Filling answers...");
      const results = await window.ApplicatorRouter.apply(siteType, answerInstructions);

      if (results.failed > 0) {
        console.warn(`[Quiz Solver] ⚠️ ${results.failed} questions failed to fill`);
      }

      console.log("[Quiz Solver] ✔️ Quiz solved!");
      console.log(`[Quiz Solver] 📊 Results: ${results.success}/${results.total} answered`);
    } catch (error) {
      window.ErrorHandlerPopup.handleError(error);
    }
  }

  /**
   * Handle undo trigger (Ctrl+Shift+E)
   */
  function handleUndoTrigger() {
    console.log("[Quiz Solver] ↶ Undo triggered!");
    // TODO: Implement undo functionality
  }

  /**
   * Cleanup function
   */
  function cleanup() {
    document.removeEventListener("keydown", handleKeyboardShortcut);
    console.log("[Quiz Solver] Cleaned up");
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  // Cleanup on page unload
  window.addEventListener("beforeunload", cleanup);
})();
