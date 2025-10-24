/**
 * DOMManager - Handles DOM extraction and cleaning
 *
 * Example usage:
 * const domManager = new DOMManager();
 * const domData = domManager.extractCleanHTML();
 * console.log(domData);
 */
class DOMManager {
  /**
   * Extract raw HTML from entire page
   * @returns {string} Full HTML including <html> tag
   */
  extractRawBodyHTML() {
    return document.body.innerHTML;
  }

  /**
   * Clean HTML by removing scripts, styles, iframes, and comments
   * @param {string} html - Raw HTML string
   * @returns {string} Cleaned HTML string
   */
  cleanHTML(html) {
    let cleanedHTML = html
      .replace(/<script[\s\S]*?<\/script>/gi, "") // Remove scripts
      .replace(/<style[\s\S]*?<\/style>/gi, "") // Remove styles
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, "") // Remove iframes
      .replace(/<!--[\s\S]*?-->/g, "") // Remove HTML comments
      .replace(/\s+/g, " ") // Collapse whitespace
      .replace(/<svg[\s\S]*?<\/svg>/gi, "") // Remove SVGs
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, "") // Remove noscript tags
      .trim();
    return cleanedHTML;
  }

  /**
   * Main extraction function - gets and cleans HTML
   * @returns {object} Object containing raw HTML, cleaned HTML, and metadata
   */
  extractCleanHTML() {
    const rawHTML = this.extractRawBodyHTML();
    const cleanedHTML = this.cleanHTML(rawHTML);

    return {
      rawHTML: rawHTML,
      cleanedHTML: cleanedHTML,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };
  }
}

window.DOMManager = DOMManager; // Make globally available
