/**
 * ERROR HANDLER - Chrome-style error popup
 */
const ErrorHandlerPopup = (function () {
  function handleError(error) {
    console.error("[Quiz Solver] ❌ ERROR OCCURRED:");
    console.error("[Quiz Solver] Error type:", error.name);
    console.error("[Quiz Solver] Error message:", error.message);
    console.error("[Quiz Solver] Stack trace:", error.stack);

    showErrorPopup(error);
  }

  function showErrorPopup(error) {
    const overlay = document.createElement("div");
    overlay.id = "quiz-solver-error-overlay";
    overlay.className = "qz-error-overlay";

    const popup = document.createElement("div");
    popup.className = "qz-error-popup";
    popup.innerHTML = `
      <div class="qz-error-body">
        <h2 class="qz-error-title">Reload site?</h2>
        <p class="qz-error-message">Changes you made may not be saved.</p>
        <div class="qz-error-footer">
          <button class="qz-error-btn qz-btn-primary" id="qz-reload">Reload</button>
          <button class="qz-error-btn qz-btn-secondary" id="qz-cancel">Cancel</button>
        </div>
      </div> 
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    document.getElementById("qz-reload").addEventListener("click", () => location.reload());
    document.getElementById("qz-cancel").addEventListener("click", removePopup);
  }

  function removePopup() {
    const overlay = document.getElementById("quiz-solver-error-overlay");
    if (overlay) overlay.remove();
  }

  return { handleError };
})();

window.ErrorHandlerPopup = ErrorHandlerPopup;
