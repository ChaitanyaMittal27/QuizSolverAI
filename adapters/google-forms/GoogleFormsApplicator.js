/**
 * Google Forms Answer Applicator
 * Applies AI-generated answers to Google Forms
 */
const GoogleFormsApplicator = (function () {
  async function applyAnswers(answerInstructions) {
    console.log("[GoogleFormsApplicator] ✏️ Applying answers...");
    console.log("[GoogleFormsApplicator] Total answers:", answerInstructions.answers.length);

    const results = {
      total: answerInstructions.answers.length,
      success: 0,
      failed: 0,
      details: [],
    };

    for (const answer of answerInstructions.answers) {
      try {
        console.log(`[GoogleFormsApplicator] Processing ${answer.qid}...`);

        if (answer.question_type === "radio") {
          applyRadioAnswer(answer);
        } else if (answer.question_type === "checkbox") {
          applyCheckboxAnswer(answer);
        } else if (answer.question_type === "text") {
          applyTextAnswer(answer);
        } else if (answer.question_type === "textarea") {
          applyTextareaAnswer(answer);
        }

        results.success++;
        results.details.push({ qid: answer.qid, status: "success" });
        console.log(`[GoogleFormsApplicator] ✓ ${answer.qid} completed`);
      } catch (error) {
        console.warn(`[GoogleFormsApplicator] ⚠️ Failed ${answer.qid}:`, error.message);
        results.failed++;
        results.details.push({ qid: answer.qid, status: "failed", error: error.message });
      }
    }

    console.log("[GoogleFormsApplicator] ✅ Complete!");
    console.log(`[GoogleFormsApplicator] Success: ${results.success}/${results.total}`);
    if (results.failed > 0) {
      console.warn(`[GoogleFormsApplicator] Failed: ${results.failed}`);
    }

    return results;
  }

  /**
   * Apply radio answer
   * Uses option_id (unique) instead of option_value (not unique for True/False)
   */
  function applyRadioAnswer(answer) {
    const option = answer.correct_option;

    // Try option_id first (unique identifier - prevents True/False collision)
    let element = null;
    if (option.option_id) {
      element = document.getElementById(option.option_id);
    }

    // Fallback to option_value if option_id fails
    if (!element && option.option_value) {
      console.warn(`[GoogleFormsApplicator] Could not find by ID, trying data-value`);
      element = document.querySelector(`div[role="radio"][data-value="${option.option_value}"]`);
    }

    // Final fallback to option_text
    if (!element && option.option_text) {
      console.warn(`[GoogleFormsApplicator] Could not find by text, using fallback`);
      element = document.querySelector(`div[role="radio"][data-value="${option.option_text}"]`);
    }

    if (!element) throw new Error(`Radio not found for ${answer.qid}`);

    element.click();
    console.log(`[GoogleFormsApplicator]   → Selected: "${option.option_text}"`);
  }

  /**
   * Apply checkbox answer
   * Uses option_id (unique) instead of option_value (may not be unique)
   */
  function applyCheckboxAnswer(answer) {
    console.log(`[GoogleFormsApplicator]   → Checking ${answer.correct_options.length} options`);

    for (const option of answer.correct_options) {
      // Try option_id first (unique identifier)
      let element = null;
      if (option.option_id) {
        element = document.getElementById(option.option_id);
      }

      // Fallback to option_value if option_id fails
      if (!element && option.option_value) {
        console.warn(`[GoogleFormsApplicator] Could not find by ID, trying data-answer-value`);
        element = document.querySelector(`div[role="checkbox"][data-answer-value="${option.option_value}"]`);
      }

      // Final fallback to option_text
      if (!element && option.option_text) {
        console.warn(`[GoogleFormsApplicator] Could not find by data-answer-value, trying text`);
        element = document.querySelector(`div[role="checkbox"][data-answer-value="${option.option_text}"]`);
      }

      if (!element) {
        console.warn(`[GoogleFormsApplicator]   ⚠️ Checkbox not found: ${option.option_text}`);
        continue;
      }

      element.click();
      console.log(`[GoogleFormsApplicator]   → Checked: "${option.option_text}"`);
    }
  }

  /**
   * Apply text answer
   * Uses question_id (provided by AI) to locate the question container,
   * then finds the input element inside it
   */
  function applyTextAnswer(answer) {
    // question_id is provided by AI (not enrichment)
    if (!answer.question_id) {
      throw new Error(`Text input not found: missing question_id for ${answer.qid}`);
    }

    const questionHeading = document.getElementById(answer.question_id);
    if (!questionHeading) {
      throw new Error(`Text input not found: question heading ${answer.question_id} not found`);
    }

    const container = questionHeading.closest(".Qr7Oae");
    if (!container) {
      throw new Error(`Text input not found: container not found for ${answer.question_id}`);
    }

    // Find input with jsname="YPqjbf" (Google Forms standard attribute)
    const element = container.querySelector('input[jsname="YPqjbf"]');
    if (!element) {
      throw new Error(`Text input not found: input element not in container`);
    }

    fillInput(element, answer.text_answer);
    console.log(`[GoogleFormsApplicator]   → Typed: "${answer.text_answer}"`);
  }

  /**
   * Apply textarea answer
   * Uses question_id (provided by AI) to locate the question container,
   * then finds the textarea element inside it
   */
  function applyTextareaAnswer(answer) {
    // question_id is provided by AI (not enrichment)
    if (!answer.question_id) {
      throw new Error(`Textarea not found: missing question_id for ${answer.qid}`);
    }

    const questionHeading = document.getElementById(answer.question_id);
    if (!questionHeading) {
      throw new Error(`Textarea not found: question heading ${answer.question_id} not found`);
    }

    const container = questionHeading.closest(".Qr7Oae");
    if (!container) {
      throw new Error(`Textarea not found: container not found for ${answer.question_id}`);
    }

    // Find textarea with jsname="YPqjbf" (Google Forms standard attribute)
    const element = container.querySelector('textarea[jsname="YPqjbf"]');
    if (!element) {
      throw new Error(`Textarea not found: textarea element not in container`);
    }

    fillInput(element, answer.text_answer);
    console.log(`[GoogleFormsApplicator]   → Typed: "${answer.text_answer.substring(0, 50)}..."`);
  }

  /**
   * Fill input/textarea with proper event dispatching
   * Google Forms requires input and change events to register the value
   */
  function fillInput(element, value) {
    element.value = value;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  return { applyAnswers };
})();

window.GoogleFormsApplicator = GoogleFormsApplicator;
