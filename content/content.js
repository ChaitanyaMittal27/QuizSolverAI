/**
 * Quiz Solver Extension - Main Content Script
 * handle calls internally directly for within context, only API calls will be await asynced
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
    console.log("[Quiz Solver] Extension loading..."); // DEBUG log
    if (isInitialized) {
      console.log("[Quiz Solver] Already initialized");
      return;
    }

    // setup requirements
    setupKeyboardListeners();
    await initializeGeminiAPI();

    // mark as initialized
    isInitialized = true;
    console.log("[Quiz Solver] Extension loaded successfully! 🚀"); // DEBUG log
  }

  function handleNotSolvableError(error) {
    ErrorHandlerPopup.handleError(error);
    console.error("[Quiz Solver] Error:", error);
  }

  // testing error popup
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "E") {
      e.preventDefault();
      handleError(new Error("This is a test error for the popup display."));
    }
  });

  /**
   * Setup keyboard event listeners
   * will call the handleKeyboardShortcut function
   */
  function setupKeyboardListeners() {
    document.addEventListener("keydown", handleKeyboardShortcut);
    console.log("[Quiz Solver] Keyboard listeners registered"); // DEBUG log
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
      // Extract DOM
      const domManager = new window.DOMManager();
      const domData = domManager.extractCleanHTML();

      // snapshot current state

      // check services
      if (!geminiService) {
        console.error("[Quiz Solver] ❌ Gemini service not initialized");
        return;
      }
      // Extract structure
      const quizStructure = await window.StructureExtractorController.extract(domData, geminiService);
      // console.log("[Quiz Solver] ✅ Quiz structure extracted:", quizStructure); // DEBUG log

      // Extract answers
      //console.log("[Quiz Solver] 🧠 Generating answers...");
      const answerInstructions = await window.AIAnswerGenerator.generateAnswers(quizStructure, geminiService);
      //console.log("[Quiz Solver] ✅ Answers generated!");
      //console.log("[Quiz Solver] 📋 Answer Instructions:");
      //console.log(JSON.stringify(answerInstructions, null, 2));

      // Fill answers
      console.log("[Quiz Solver] ✍️ Filling answers...");
      const results = await window.AnswerApplicator.applyAnswers(answerInstructions);
      if (results.failed > 0) {
        console.warn(`[Quiz Solver] ⚠️ ${results.failed} questions failed to fill`);
      }
      console.log("[Quiz Solver] ✔️ Quiz solved!");
      console.log(`[Quiz Solver] 📊 Results: ${results.success}/${results.total} answered`);

      console.log("[Quiz Solver] ✔️ Solve process completed!");
    } catch (error) {
      handleNotSolvableError(error);
    }
  }

  /**
   * Handle undo trigger (Ctrl+Shift+Z)
   */
  function handleUndoTrigger() {
    console.log("[Quiz Solver] ↶ Undo triggered!");
    // TODO: Phase 9 - Restore snapshot
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
