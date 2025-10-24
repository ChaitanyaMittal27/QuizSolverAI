/**
 * Google Forms Extractor
 * Manual DOM extraction for Google Forms
 */
const GoogleFormsExtractor = (function () {
  /**
   * Extract complete quiz structure from Google Forms
   * @param {string} html - The HTML content
   * @param {string} url - The page URL
   * @returns {Promise<Object>} Quiz structure
   */
  async function extractStructure(html, url) {
    console.log("[GoogleFormsExtractor] Starting manual extraction...");

    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Extract title
    const titleElement = doc.querySelector('.F9yp7e.ikZYwf.LgNcQe, [role="heading"][aria-level="1"]');
    const title = titleElement ? titleElement.textContent.trim() : "Untitled Form";

    // Extract description
    const descElement = doc.querySelector(".cBGGJ.OIC90c");
    const description = descElement ? descElement.textContent.trim() : "";

    console.log(`[GoogleFormsExtractor] Found title: "${title}"`);

    // Extract all questions
    const questions = extractQuestions(doc);

    console.log(`[GoogleFormsExtractor] Extracted ${questions.length} questions`);

    // Build structure matching AI format
    const structure = {
      quizMetadata: {
        url: url,
        platform: "google_forms",
        title: title,
        description: description,
        timestamp: new Date().toISOString(),
      },
      questions: questions,
    };

    return structure;
  }

  /**
   * Extract all questions from the form
   */
  function extractQuestions(doc) {
    const questions = [];

    // Find all question containers
    const questionContainers = doc.querySelectorAll('.Qr7Oae[role="listitem"]');

    questionContainers.forEach((container, index) => {
      try {
        const question = extractQuestion(container, index);
        if (question) {
          questions.push(question);
        }
      } catch (error) {
        console.warn(`[GoogleFormsExtractor] Failed to extract question ${index + 1}:`, error);
      }
    });

    return questions;
  }

  /**
   * Extract a single question with FULL selector details
   */
  function extractQuestion(container, index) {
    // Get question text
    const questionTextElement = container.querySelector(".M7eMe");
    if (!questionTextElement) {
      return null; // Skip non-question elements
    }

    const questionText = questionTextElement.textContent.trim();

    // Get question heading element (for ID)
    const headingElement = container.querySelector('[role="heading"][aria-level="3"]');
    const questionId = headingElement ? headingElement.id : null;

    // Check if required
    const requiredElement = container.querySelector(".vnumgf");
    const required = !!requiredElement;

    // Get points (if quiz mode)
    const pointsElement = container.querySelector('.nUvMO.FUQCPb[role="note"]');
    const points = pointsElement ? parseInt(pointsElement.textContent.match(/\d+/)?.[0] || 0) : null;

    // Detect question type
    const questionType = detectQuestionType(container);

    // Build base question object
    const question = {
      qid: `q${index + 1}`,
      question_id: questionId,
      question_class: "geS5n",
      question_name: null,
      question_text: questionText,
      question_type: questionType,
      required: required,
      points: points,
    };

    // Extract type-specific details
    if (questionType === "radio") {
      extractRadioDetails(container, question);
    } else if (questionType === "checkbox") {
      extractCheckboxDetails(container, question);
    } else if (questionType === "text" || questionType === "textarea") {
      extractTextDetails(container, question, questionType);
    }

    return question;
  }

  /**
   * Detect the type of question
   */
  function detectQuestionType(container) {
    if (container.querySelector('[role="radiogroup"]')) return "radio";
    if (container.querySelector('[role="checkbox"]')) return "checkbox";
    if (container.querySelector("textarea")) return "textarea";
    if (container.querySelector('input[type="text"]')) return "text";
    return "unknown";
  }

  /**
   * Extract radio button details
   */
  function extractRadioDetails(container, question) {
    const radioButtons = container.querySelectorAll('[role="radio"]');

    // Get input name from hidden input if present
    const hiddenInput = container.querySelector('input[type="hidden"][name*="entry"]');
    const inputName = hiddenInput ? hiddenInput.name.replace("_sentinel", "") : null;

    question.input_name = inputName;
    question.selector = inputName ? `div[data-value][aria-label]` : 'div[role="radio"]';
    question.options = [];

    radioButtons.forEach((radio, idx) => {
      const value = radio.getAttribute("data-value");
      const ariaLabel = radio.getAttribute("aria-label");
      const textSpan = radio.closest("label")?.querySelector(".aDTYNe.snByac");
      const optionText = ariaLabel || (textSpan ? textSpan.textContent.trim() : value);

      if (optionText) {
        question.options.push({
          oid: `opt${idx + 1}`,
          option_id: radio.id,
          option_class: "Od2TWd hYsg7c",
          option_name: inputName,
          option_text: optionText,
          option_value: value,
          selector: `div[role="radio"][data-value="${value}"]`,
        });
      }
    });
  }

  /**
   * Extract checkbox details
   */
  function extractCheckboxDetails(container, question) {
    const checkboxes = container.querySelectorAll('[role="checkbox"]');

    // Get input name from hidden input
    const hiddenInput = container.querySelector('input[type="hidden"][name*="entry"]');
    const inputName = hiddenInput ? hiddenInput.name.replace("_sentinel", "") : null;

    question.input_name = inputName;
    question.selector = 'div[role="checkbox"]';
    question.options = [];

    checkboxes.forEach((checkbox, idx) => {
      const value = checkbox.getAttribute("data-answer-value");
      const ariaLabel = checkbox.getAttribute("aria-label");
      const textSpan = checkbox.closest("label")?.querySelector(".aDTYNe.snByac");
      const optionText = ariaLabel || (textSpan ? textSpan.textContent.trim() : value);

      if (optionText) {
        question.options.push({
          oid: `opt${idx + 1}`,
          option_id: checkbox.id,
          option_class: "uVccjd aiSeRd",
          option_name: inputName,
          option_text: optionText,
          option_value: value,
          selector: `div[role="checkbox"][data-answer-value="${value}"]`,
        });
      }
    });
  }

  /**
   * Extract text/textarea input details
   * FIX: Extract the actual name attribute, not aria-labelledby
   */
  function extractTextDetails(container, question, type) {
    const input =
      type === "textarea" ? container.querySelector("textarea") : container.querySelector('input[type="text"]');

    if (input) {
      // Get the ACTUAL name attribute (not aria-labelledby) ← FIX
      const inputName = input.getAttribute("name");
      const inputId = input.id || null;
      const ariaLabelledBy = input.getAttribute("aria-labelledby");

      question.input_id = inputId;
      question.input_class = input.className;
      question.input_name = inputName; // ← FIX: Use actual name attribute

      // Build selector - try multiple strategies
      if (inputName) {
        // Best: Use name attribute
        question.selector =
          type === "textarea" ? `textarea[name="${inputName}"]` : `input[type="text"][name="${inputName}"]`;
      } else if (ariaLabelledBy) {
        // Fallback: Use aria-labelledby
        question.selector =
          type === "textarea"
            ? `textarea[aria-labelledby*="${question.question_id}"]`
            : `input[type="text"][aria-labelledby*="${question.question_id}"]`;
      } else if (inputId) {
        // Last resort: Use ID
        question.selector = `#${inputId}`;
      }
    }
  }

  return {
    extractStructure,
  };
})();

// Expose globally
window.GoogleFormsExtractor = GoogleFormsExtractor;
