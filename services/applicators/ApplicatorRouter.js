/**
 * Applicator Router - Routes to site-specific applicator
 */
const ApplicatorRouter = (function () {
  /**
   * Apply answers using appropriate applicator for the site
   * @param {string} siteType - Site type from AdapterRouter
   * @param {Object} answerInstructions - Answer instructions
   * @returns {Promise<Object>} Results
   */
  async function apply(siteType, answerInstructions) {
    console.log("[ApplicatorRouter] Routing to applicator for:", siteType);

    switch (siteType) {
      case "canvas":
        return await window.CanvasApplicator.applyAnswers(answerInstructions);

      case "googleForms":
        return await window.GoogleFormsApplicator.applyAnswers(answerInstructions);

      default:
        return await window.GenericApplicator.applyAnswers(answerInstructions);
    }
  }

  return { apply };
})();

window.ApplicatorRouter = ApplicatorRouter;
