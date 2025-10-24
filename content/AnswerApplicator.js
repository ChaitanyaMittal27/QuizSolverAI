/**
 * ANSWER APPLICATOR - Fill quiz answers
 * Takes answer instructions and applies them to the DOM
 */
const AnswerApplicator = (function () {
  /**
   * Apply all answers to the quiz
   * @param {Object} answerInstructions - Answer instructions from Phase 4
   * @returns {Object} Results summary
   */
  async function applyAnswers(answerInstructions) {
    console.log("[AnswerApplicator] ✍️ Applying answers...");
    console.log("[AnswerApplicator] Total answers:", answerInstructions.answers.length);

    const results = {
      total: answerInstructions.answers.length,
      success: 0,
      failed: 0,
      details: [],
    };

    // Process each answer
    for (const answer of answerInstructions.answers) {
      try {
        console.log(`[AnswerApplicator] Processing ${answer.qid}...`);

        if (answer.question_type === "radio") {
          applyRadioAnswer(answer);
          results.success++;
          results.details.push({ qid: answer.qid, status: "success" });
        } else if (answer.question_type === "checkbox") {
          applyCheckboxAnswer(answer);
          results.success++;
          results.details.push({ qid: answer.qid, status: "success" });
        } else if (answer.question_type === "text") {
          applyTextAnswer(answer);
          results.success++;
          results.details.push({ qid: answer.qid, status: "success" });
        } else if (answer.question_type === "textarea") {
          applyTextareaAnswer(answer);
          results.success++;
          results.details.push({ qid: answer.qid, status: "success" });
        }

        console.log(`[AnswerApplicator] ✓ ${answer.qid} completed`);
      } catch (error) {
        console.warn(`[AnswerApplicator] ⚠️ Failed to apply ${answer.qid}:`, error.message);
        results.failed++;
        results.details.push({
          qid: answer.qid,
          status: "failed",
          error: error.message,
        });
      }
    }

    console.log("[AnswerApplicator] ✅ Complete!");
    console.log(`[AnswerApplicator] Success: ${results.success}/${results.total}`);
    if (results.failed > 0) {
      console.warn(`[AnswerApplicator] Failed: ${results.failed}`);
    }

    return results;
  }

  /**
   * Apply radio answer (single choice)
   */
  function applyRadioAnswer(answer) {
    const option = answer.correct_option;
    const element = findElement(option.option_id, option.option_name, option.option_class);

    if (!element) {
      throw new Error(`Radio element not found for ${answer.qid}`);
    }

    // Click the radio button
    element.click();
    console.log(`[AnswerApplicator]   → Clicked: "${option.option_text}"`);
  }

  /**
   * Apply checkbox answer (multiple choice)
   */
  function applyCheckboxAnswer(answer) {
    const checkedCount = answer.correct_options.length;
    console.log(`[AnswerApplicator]   → Checking ${checkedCount} options`);

    for (const option of answer.correct_options) {
      const element = findElement(option.option_id, option.option_name, option.option_class);

      if (!element) {
        console.warn(`[AnswerApplicator]   ⚠️ Checkbox not found: ${option.option_text}`);
        continue;
      }

      // Click the checkbox
      element.click();
      console.log(`[AnswerApplicator]   → Checked: "${option.option_text}"`);
    }
  }

  /**
   * Apply text answer (short input)
   */
  function applyTextAnswer(answer) {
    const element = findInputElement(answer.input_id, answer.input_name, answer.input_class);

    if (!element) {
      throw new Error(`Text input not found for ${answer.qid}`);
    }

    // Fill the text input
    fillTextInput(element, answer.text_answer);
    console.log(`[AnswerApplicator]   → Typed: "${answer.text_answer}"`);
  }

  /**
   * Apply textarea answer (long input)
   */
  function applyTextareaAnswer(answer) {
    const element = findInputElement(answer.input_id, answer.input_name, answer.input_class);

    if (!element) {
      throw new Error(`Textarea not found for ${answer.qid}`);
    }

    // Fill the textarea
    fillTextInput(element, answer.text_answer);
    console.log(`[AnswerApplicator]   → Typed: "${answer.text_answer.substring(0, 50)}..."`);
  }

  /**
   * Find element using ID first, then name+class combo (if it fails)
   */
  function findElement(id, name, className) {
    // Strategy 1: Try ID first (most specific)
    if (id) {
      const element = document.querySelector("#" + id);
      if (element) {
        console.log(`[AnswerApplicator]   Found by ID: #${id}`);
        return element;
      }
    }

    // Strategy 2: Try name + class combo (compound selector)
    if (name && className) {
      const firstClass = className.split(" ")[0];
      const element = document.querySelector(`input[name="${name}"].${firstClass}`);
      if (element) {
        console.log(`[AnswerApplicator]   Found by name+class: input[name="${name}"].${firstClass}`);
        return element;
      }
    }

    // Not found
    console.warn(`[AnswerApplicator]   ⚠️ Element not found (id: ${id}, name: ${name})`);
    return null;
  }

  /**
   * Find input/textarea element
   */
  function findInputElement(id, name, className) {
    // Strategy 1: Try ID
    if (id) {
      const element = document.querySelector("#" + id);
      if (element) {
        console.log(`[AnswerApplicator]   Found input by ID: #${id}`);
        return element;
      }
    }

    // Strategy 2: Try name + class
    if (name && className) {
      const firstClass = className.split(" ")[0];
      // Try input first
      let element = document.querySelector(`input[name="${name}"].${firstClass}`);
      if (element) {
        console.log(`[AnswerApplicator]   Found by name+class: input[name="${name}"].${firstClass}`);
        return element;
      }
      // Try textarea
      element = document.querySelector(`textarea[name="${name}"].${firstClass}`);
      if (element) {
        console.log(`[AnswerApplicator]   Found by name+class: textarea[name="${name}"].${firstClass}`);
        return element;
      }
    }

    // Not found
    console.warn(`[AnswerApplicator]   ⚠️ Input not found (id: ${id}, name: ${name})`);
    return null;
  }

  /**
   * Fill text input with proper events
   */
  function fillTextInput(element, value) {
    // 1. Focus (click in)
    element.focus();

    // 2. Set value
    element.value = value;

    // 3. Trigger events
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));

    // 4. Blur (click outside)
    element.blur();
  }

  // Public API
  return {
    applyAnswers,
  };
})();

window.AnswerApplicator = AnswerApplicator;
