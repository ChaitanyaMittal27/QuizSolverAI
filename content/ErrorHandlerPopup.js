/**
 * ERROR HANDLER - Shows error popup and logs details
 */
const ErrorHandlerPopup = (function () {
  /**
   * Handle error - show popup and log
   * @param {Error} error - The error object
   */
  function handleError(error) {
    console.error("[Quiz Solver] ❌ ERROR OCCURRED:");
    console.error("[Quiz Solver] Error type:", error.name);
    console.error("[Quiz Solver] Error message:", error.message);
    console.error("[Quiz Solver] Stack trace:", error.stack);

    // Show error popup to user
    showErrorPopup(error);
  }

  function showErrorPopup(error) {
    // Create overlay
    const overlay = document.createElement("div");
    overlay.id = "quiz-solver-error-overlay";
    overlay.className = "qz-error-overlay";

    // Create popup
    const popup = document.createElement("div");
    popup.className = "qz-error-popup";
    const userMessage = "An unexpected error occurred. Please try again or refresh the page.";
    popup.innerHTML = `     
      <div class="qz-error-body">
        <p class="qz-error-message">${userMessage}</p>
        <div class="qz-error-footer">
          <button class="qz-error-btn qz-btn-secondary" id="qz-refresh">Refresh</button>
          <button class="qz-error-btn qz-btn-primary" id="qz-close">Close</button>
        </div>
      </div> 
    `;

    // append and event listeners
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    document.getElementById("qz-refresh").addEventListener("click", () => location.reload());
    document.getElementById("qz-close").addEventListener("click", removePopup);
  }

  /**
   * Remove error popup
   */
  function removePopup() {
    const overlay = document.getElementById("quiz-solver-error-overlay");
    if (overlay) {
      overlay.remove();
    }
  }

  return { handleError };
})();

window.ErrorHandlerPopup = ErrorHandlerPopup;
