/**
 * PromptController - Site detection and prompt selection
 */
const PromptController = (function () {
  const SITE_PATTERNS = {
    canvas: /canvas\./i,
    googleForms: /docs\.google\.com\/forms/i,
    moodle: /moodle\./i,
  };

  function detectSite(url) {
    if (SITE_PATTERNS.canvas.test(url)) return "canvas";
    if (SITE_PATTERNS.googleForms.test(url)) return "googleForms";
    if (SITE_PATTERNS.moodle.test(url)) return "moodle";
    return "generic";
  }

  function getPrompt(html, url) {
    const siteType = detectSite(url);
    console.log("[PromptController] Detected site:", siteType);

    switch (siteType) {
      case "canvas":
        return window.CanvasPrompt.build(html, url);
      case "googleForms":
        return window.GoogleFormsPrompt.build(html, url);
      case "moodle":
        return window.MoodlePrompt.build(html, url);
      default:
        return window.GenericPrompt.build(html, url);
    }
  }
  return { detectSite, getPrompt };
})();

window.PromptController = PromptController;
