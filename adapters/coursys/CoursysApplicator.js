/**
 * Coursys Applicator - CourSys-specific answer filling
 * Applies answers to SFU CourSys forms
 */
const CoursysApplicator = (function () {
  async function applyAnswers(answerInstructions) {
    console.log("[CoursysApplicator] ✏️ Applying answers to CourSys form...");
    console.log("[CoursysApplicator] Total answers:", answerInstructions.answers.length);

    const results = {
      total: answerInstructions.answers.length,
      success: 0,
      failed: 0,
      details: [],
    };

    for (const answer of answerInstructions.answers) {
      try {
        console.log(`[CoursysApplicator] Processing ${answer.qid}...`);

        if (answer.question_type === "radio") {
          applyRadio(answer);
        } else if (answer.question_type === "checkbox") {
          applyCheckbox(answer);
        } else if (answer.question_type === "text") {
          applyText(answer);
        } else if (answer.question_type === "textarea") {
          applyTextarea(answer);
        } else if (answer.question_type === "select") {
          applySelect(answer);
        } else if (answer.question_type === "file") {
          console.warn(`[CoursysApplicator] ⚠️ Skipping file upload: ${answer.qid}`);
          continue; // Skip file uploads
        } else {
          throw new Error(`Unknown type: ${answer.question_type}`);
        }

        results.success++;
        results.details.push({ qid: answer.qid, status: "success" });
        console.log(`[CoursysApplicator] ✓ ${answer.qid} completed`);
      } catch (error) {
        console.warn(`[CoursysApplicator] ⚠️ Failed ${answer.qid}:`, error.message);
        results.failed++;
        results.details.push({ qid: answer.qid, status: "failed", error: error.message });
      }
    }

    console.log(`[CoursysApplicator] ✅ Success: ${results.success}/${results.total}`);
    return results;
  }

  /**
   * Apply radio answer - ID-first strategy
   */
  function applyRadio(answer) {
    const option = answer.correct_option;

    // Try ID first (most reliable)
    let element = document.getElementById(option.option_id);

    // Fallback: name + value
    if (!element && option.option_name && option.option_value) {
      element = document.querySelector(
        `input[type="radio"][name="${option.option_name}"][value="${option.option_value}"]`
      );
    }

    if (!element) throw new Error("Radio not found");

    element.click();
    console.log(`  → Clicked: "${option.option_text}"`);
  }

  /**
   * Apply checkbox answer - ID-first strategy
   */
  function applyCheckbox(answer) {
    answer.correct_options.forEach((option) => {
      // Try ID first (most reliable)
      let element = document.getElementById(option.option_id);

      // Fallback: name + value
      if (!element && option.option_name && option.option_value) {
        element = document.querySelector(
          `input[type="checkbox"][name="${option.option_name}"][value="${option.option_value}"]`
        );
      }

      if (element) {
        element.click();
        console.log(`  → Checked: "${option.option_text}"`);
      }
    });
  }

  /**
   * Apply text answer - ID-first strategy
   */
  function applyText(answer) {
    let element = document.getElementById(answer.input_id);

    // Fallback: name attribute
    if (!element && answer.input_name) {
      element = document.querySelector(`input[type="text"][name="${answer.input_name}"]`);
    }

    if (!element) throw new Error("Text input not found");

    fillInput(element, answer.text_answer);
    console.log(`  → Typed: "${answer.text_answer}"`);
  }

  /**
   * Apply textarea answer - ID-first strategy
   */
  function applyTextarea(answer) {
    let element = document.getElementById(answer.input_id);

    // Fallback: name attribute
    if (!element && answer.input_name) {
      element = document.querySelector(`textarea[name="${answer.input_name}"]`);
    }

    if (!element) throw new Error("Textarea not found");

    fillInput(element, answer.text_answer);
    const preview = answer.text_answer.substring(0, 50);
    console.log(`  → Typed: "${preview}..."`);
  }

  /**
   * Apply select/dropdown answer
   */
  function applySelect(answer) {
    let element = document.getElementById(answer.input_id);

    // Fallback: name attribute
    if (!element && answer.input_name) {
      element = document.querySelector(`select[name="${answer.input_name}"]`);
    }

    if (!element) throw new Error("Select not found");

    // Set the value
    element.value = answer.selected_option.option_value;

    // Dispatch events
    element.dispatchEvent(new Event("change", { bubbles: true }));
    element.dispatchEvent(new Event("input", { bubbles: true }));

    console.log(`  → Selected: "${answer.selected_option.option_text}"`);
  }

  /**
   * Fill input/textarea with proper event dispatching
   * CourSys uses standard form handling
   */
  function fillInput(element, value) {
    // Focus
    element.focus();

    // Set value
    element.value = value;

    // Dispatch events (standard form events)
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));

    // Additional InputEvent (for React-like frameworks if used)
    const inputEvent = new InputEvent("input", {
      bubbles: true,
      cancelable: true,
      data: value,
      inputType: "insertText",
    });
    element.dispatchEvent(inputEvent);

    // Blur
    element.blur();
  }

  return { applyAnswers };
})();

window.CoursysApplicator = CoursysApplicator;
