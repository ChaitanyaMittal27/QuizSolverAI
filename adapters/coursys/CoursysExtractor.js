/**
 * Coursys Extractor - Manual DOM extraction
 * Extracts quiz/form structure from SFU CourSys platform
 */
const CoursysExtractor = (function () {
  /**
   * Extract quiz structure from CourSys form
   * @param {string} html - Cleaned HTML
   * @param {string} url - Page URL
   * @returns {Promise<Object>} Quiz structure JSON
   */
  async function extractStructure(html, url) {
    console.log("[CoursysExtractor] Starting manual extraction...");

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // CourSys structure: form.close-warn > fieldset > dl.dlform
    const dlform = doc.querySelector("dl.dlform");
    if (!dlform) {
      console.log("[CoursysExtractor] No dl.dlform found");
      return null;
    }

    // Extract form title
    const titleElement = doc.querySelector(".title h1");
    const title = titleElement ? titleElement.textContent.trim() : "CourSys Form";

    const questions = [];
    const dtElements = dlform.querySelectorAll("dt");

    console.log(`[CoursysExtractor] Found ${dtElements.length} dt elements`);

    dtElements.forEach((dt, idx) => {
      try {
        const question = extractQuestion(dt, idx);
        if (question) {
          questions.push(question);
        }
      } catch (error) {
        console.warn(`[CoursysExtractor] Failed to extract question ${idx + 1}:`, error.message);
      }
    });

    if (questions.length === 0) {
      console.log("[CoursysExtractor] No valid questions extracted");
      return null;
    }

    console.log(`[CoursysExtractor] ✅ Extracted ${questions.length} questions`);
    console.log(questions);

    return {
      quizMetadata: {
        url: url,
        platform: "coursys",
        title: title,
        timestamp: new Date().toISOString(),
      },
      questions: questions,
    };
  }

  /**
   * Extract a single question
   */
  function extractQuestion(dt, index) {
    // Get label element
    const label = dt.querySelector("label");
    if (!label) return null;

    // Get question text (remove required icon text)
    const questionText = label.textContent.replace(/\s*This field is required\.\s*/g, "").trim();

    // Skip if it's just an explanation or HR
    if (!questionText || questionText === "") return null;

    // Get the for attribute to find the input ID
    const forAttr = label.getAttribute("for");
    if (!forAttr) return null;

    // Check if required
    const required = !!dt.querySelector(".reqicon");

    // Get the next dd element (contains the input)
    const dd = dt.nextElementSibling;
    if (!dd || dd.tagName !== "DD") return null;

    // Build base question
    const question = {
      qid: `q${index + 1}`,
      question_id: forAttr,
      question_class: "dlform",
      question_name: null,
      question_text: questionText,
      question_type: null,
      required: required,
      points: null,
    };

    // Detect question type and extract details
    const fieldDiv = dd.querySelector(".field");
    if (!fieldDiv) return null;

    // Check for explanation blocks or HR (not actual questions)
    if (fieldDiv.querySelector(".explanation_block") || fieldDiv.querySelector("hr")) {
      return null;
    }

    // Radio buttons
    if (fieldDiv.querySelector('input[type="radio"]')) {
      extractRadioDetails(fieldDiv, question, forAttr);
    }
    // Checkboxes
    else if (fieldDiv.querySelector('input[type="checkbox"]')) {
      extractCheckboxDetails(fieldDiv, question, forAttr);
    }
    // Textarea
    else if (fieldDiv.querySelector("textarea")) {
      extractTextareaDetails(fieldDiv, question);
    }
    // Select/dropdown
    else if (fieldDiv.querySelector("select")) {
      extractSelectDetails(fieldDiv, question);
    }
    // Text input
    else if (fieldDiv.querySelector('input[type="text"]')) {
      extractTextDetails(fieldDiv, question);
    }
    // File upload
    else if (fieldDiv.querySelector('input[type="file"]')) {
      extractFileDetails(fieldDiv, question);
    }

    return question.question_type ? question : null;
  }

  /**
   * Extract radio button details
   */
  function extractRadioDetails(fieldDiv, question, forAttr) {
    question.question_type = "radio";
    question.options = [];

    const radios = fieldDiv.querySelectorAll('input[type="radio"]');
    const inputName = radios[0] ? radios[0].getAttribute("name") : null;
    question.input_name = inputName;

    radios.forEach((radio, idx) => {
      const optionId = radio.id;
      const optionValue = radio.getAttribute("value");
      const optionLabel = radio.closest("label");
      const optionText = optionLabel ? optionLabel.textContent.trim() : `Option ${idx + 1}`;

      question.options.push({
        oid: `opt${idx + 1}`,
        option_id: optionId,
        option_name: inputName,
        option_class: radio.className,
        option_text: optionText,
        option_value: optionValue,
        selector: `#${optionId}`,
      });
    });
  }

  /**
   * Extract checkbox details
   */
  function extractCheckboxDetails(fieldDiv, question, forAttr) {
    question.question_type = "checkbox";
    question.options = [];

    const checkboxes = fieldDiv.querySelectorAll('input[type="checkbox"]');
    const inputName = checkboxes[0] ? checkboxes[0].getAttribute("name") : null;
    question.input_name = inputName;

    checkboxes.forEach((checkbox, idx) => {
      const optionId = checkbox.id;
      const optionValue = checkbox.getAttribute("value");
      const optionLabel = checkbox.closest("label");
      const optionText = optionLabel ? optionLabel.textContent.trim() : `Option ${idx + 1}`;

      question.options.push({
        oid: `opt${idx + 1}`,
        option_id: optionId,
        option_name: inputName,
        option_class: checkbox.className,
        option_text: optionText,
        option_value: optionValue,
        selector: `#${optionId}`,
      });
    });
  }

  /**
   * Extract text input details
   */
  function extractTextDetails(fieldDiv, question) {
    question.question_type = "text";
    const input = fieldDiv.querySelector('input[type="text"]');

    if (input) {
      question.input_id = input.id;
      question.input_name = input.getAttribute("name");
      question.input_class = input.className;
      question.selector = `#${input.id}`;
    }
  }

  /**
   * Extract textarea details
   */
  function extractTextareaDetails(fieldDiv, question) {
    question.question_type = "textarea";
    const textarea = fieldDiv.querySelector("textarea");

    if (textarea) {
      question.input_id = textarea.id;
      question.input_name = textarea.getAttribute("name");
      question.input_class = textarea.className;
      question.selector = `#${textarea.id}`;
    }
  }

  /**
   * Extract select/dropdown details
   */
  function extractSelectDetails(fieldDiv, question) {
    question.question_type = "select";
    question.options = [];

    const select = fieldDiv.querySelector("select");
    if (!select) return;

    const inputName = select.getAttribute("name");
    question.input_id = select.id;
    question.input_name = inputName;
    question.input_class = select.className;
    question.selector = `#${select.id}`;

    const options = select.querySelectorAll("option");
    options.forEach((option, idx) => {
      const optionValue = option.getAttribute("value");
      const optionText = option.textContent.trim();

      // Skip empty placeholder options
      if (!optionValue || optionValue === "") return;

      question.options.push({
        oid: `opt${idx + 1}`,
        option_value: optionValue,
        option_text: optionText,
      });
    });
  }

  /**
   * Extract file upload details
   */
  function extractFileDetails(fieldDiv, question) {
    question.question_type = "file";
    const input = fieldDiv.querySelector('input[type="file"]');

    if (input) {
      question.input_id = input.id;
      question.input_name = input.getAttribute("name");
      question.input_class = input.className;
      question.selector = `#${input.id}`;
    }
  }

  return {
    extractStructure,
  };
})();

// Expose globally
window.CoursysExtractor = CoursysExtractor;
