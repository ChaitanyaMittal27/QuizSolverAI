/**
 * Generic Applicator - Basic DOM manipulation for unknown sites
 * Fallback when no site-specific applicator exists
 */
const GenericApplicator = (function () {
  async function applyAnswers(answerInstructions) {
    console.log("[GenericApplicator] ✍️ Applying answers (generic method)...");
    console.log("[GenericApplicator] Total answers:", answerInstructions.answers.length);

    const results = {
      total: answerInstructions.answers.length,
      success: 0,
      failed: 0,
      details: [],
    };

    for (const answer of answerInstructions.answers) {
      try {
        console.log(`[GenericApplicator] Processing ${answer.qid}...`);

        if (answer.question_type === "radio") {
          applyRadio(answer);
        } else if (answer.question_type === "checkbox") {
          applyCheckbox(answer);
        } else if (answer.question_type === "text") {
          applyText(answer);
        } else if (answer.question_type === "textarea" || answer.question_type === "paragraph") {
          applyTextarea(answer);
        } else {
          throw new Error(`Unknown type: ${answer.question_type}`);
        }

        results.success++;
        results.details.push({ qid: answer.qid, status: "success" });
        console.log(`[GenericApplicator] ✓ ${answer.qid} completed`);
      } catch (error) {
        console.warn(`[GenericApplicator] ⚠️ Failed ${answer.qid}:`, error.message);
        results.failed++;
        results.details.push({ qid: answer.qid, status: "failed", error: error.message });
      }
    }

    console.log(`[GenericApplicator] ✅ Success: ${results.success}/${results.total}`);
    return results;
  }

  function applyRadio(answer) {
    const option = answer.correct_option;
    const element = findElement(option.option_id, option.option_name, option.option_class);
    if (!element) throw new Error("Radio not found");

    element.click();
    console.log(`  → Clicked: "${option.option_text}"`);
  }

  function applyCheckbox(answer) {
    answer.correct_options.forEach((option) => {
      const element = findElement(option.option_id, option.option_name, option.option_class);
      if (element) {
        element.click();
        console.log(`  → Checked: "${option.option_text}"`);
      }
    });
  }

  function applyText(answer) {
    const element = findInputElement(answer.input_id, answer.input_name, answer.input_class);
    if (!element) throw new Error("Text input not found");

    fillBasicInput(element, answer.text_answer);
    console.log(`  → Typed: "${answer.text_answer}"`);
  }

  function applyTextarea(answer) {
    const element = findInputElement(answer.input_id, answer.input_name, answer.input_class);
    if (!element) throw new Error("Textarea not found");

    fillBasicInput(element, answer.text_answer);
    const preview = answer.text_answer.substring(0, 50);
    console.log(`  → Typed: "${preview}..."`);
  }

  /**
   * Basic input filling - works for most sites
   */
  function fillBasicInput(element, value) {
    element.focus();
    element.value = value;

    // Basic events
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));

    element.blur();
  }

  /**
   * Find element with multiple strategies
   */
  function findElement(id, name, className) {
    if (id) {
      const el = document.querySelector(`#${id}`);
      if (el) return el;
    }

    if (name) {
      const el = document.querySelector(`input[name="${name}"]`);
      if (el) return el;
    }

    if (name && className) {
      const firstClass = className.split(" ")[0];
      const el = document.querySelector(`input[name="${name}"].${firstClass}`);
      if (el) return el;
    }

    return null;
  }

  function findInputElement(id, name, className) {
    if (id) {
      const el = document.querySelector(`#${id}`);
      if (el) return el;
    }

    if (name) {
      let el = document.querySelector(`input[name="${name}"]`);
      if (el) return el;

      el = document.querySelector(`textarea[name="${name}"]`);
      if (el) return el;
    }

    if (className) {
      const firstClass = className.split(" ")[0];
      let el = document.querySelector(`input.${firstClass}`);
      if (el) return el;

      el = document.querySelector(`textarea.${firstClass}`);
      if (el) return el;
    }

    return null;
  }

  return { applyAnswers };
})();

window.GenericApplicator = GenericApplicator;
