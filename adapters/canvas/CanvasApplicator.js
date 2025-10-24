/**
 * Canvas Applicator - Canvas-specific answer filling
 * Handles TinyMCE, InputEvent simulation, Canvas quirks
 */
const CanvasApplicator = (function () {
  async function applyAnswers(answerInstructions) {
    console.log("[CanvasApplicator] ✍️ Filling Canvas quiz...");
    console.log("[CanvasApplicator] Total answers:", answerInstructions.answers.length);

    const results = {
      total: answerInstructions.answers.length,
      success: 0,
      failed: 0,
      details: [],
    };

    for (const answer of answerInstructions.answers) {
      try {
        console.log(`[CanvasApplicator] Processing ${answer.qid}...`);

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
        console.log(`[CanvasApplicator] ✓ ${answer.qid} completed`);
      } catch (error) {
        console.warn(`[CanvasApplicator] ⚠️ Failed ${answer.qid}:`, error.message);
        results.failed++;
        results.details.push({ qid: answer.qid, status: "failed", error: error.message });
      }
    }

    console.log(`[CanvasApplicator] ✅ Success: ${results.success}/${results.total}`);
    return results;
  }

  function applyRadio(answer) {
    const option = answer.correct_option;
    const element = findElement(option.option_id, option.option_name);
    if (!element) throw new Error("Radio not found");

    element.click();
    console.log(`  → Clicked: "${option.option_text}"`);
  }

  function applyCheckbox(answer) {
    answer.correct_options.forEach((option) => {
      const element = findElement(option.option_id, option.option_name);
      if (element) {
        element.click();
        console.log(`  → Checked: "${option.option_text}"`);
      }
    });
  }

  function applyText(answer) {
    const element = findInputElement(answer.input_id, answer.input_name);
    if (!element) throw new Error("Text input not found");

    fillCanvasInput(element, answer.text_answer);
    console.log(`  → Typed: "${answer.text_answer}"`);
  }

  function applyTextarea(answer) {
    const element = findInputElement(answer.input_id, answer.input_name);
    if (!element) throw new Error("Textarea not found");

    fillCanvasInput(element, answer.text_answer);
    const preview = answer.text_answer.substring(0, 50);
    console.log(`  → Typed: "${preview}..."`);
  }

  /**
   * Canvas-specific input filling with InputEvent simulation
   */
  function fillCanvasInput(element, value) {
    // Focus
    element.focus();

    // Set value
    element.value = value;

    // KEY: InputEvent with inputType (Canvas/React needs this)
    const inputEvent = new InputEvent("input", {
      bubbles: true,
      cancelable: true,
      data: value,
      inputType: "insertText",
    });
    element.dispatchEvent(inputEvent);

    // Change event
    element.dispatchEvent(new Event("change", { bubbles: true }));

    // Canvas TinyMCE handling
    if (element.id && element.id.includes("question_input")) {
      updateTinyMCE(element, value);
    }

    // Blur
    element.blur();
  }

  /**
   * Update Canvas TinyMCE rich text editor
   */
  function updateTinyMCE(textarea, value) {
    // Update iframe
    const iframeId = textarea.id + "_ifr";
    const iframe = document.getElementById(iframeId);

    if (iframe?.contentWindow?.document?.body) {
      try {
        iframe.contentWindow.document.body.innerHTML = `<p>${value}</p>`;
      } catch (e) {
        console.warn("  Could not update iframe:", e.message);
      }
    }

    // Update TinyMCE editor API
    if (window.tinymce) {
      const editor = window.tinymce.get(textarea.id);
      if (editor) {
        editor.setContent(`<p>${value}</p>`);
        editor.save(); // Saves to textarea
        console.log("  → TinyMCE updated");
      }
    }
  }

  function findElement(id, name) {
    return document.querySelector(`#${id}`) || document.querySelector(`input[name="${name}"]`);
  }

  function findInputElement(id, name) {
    return (
      document.querySelector(`#${id}`) ||
      document.querySelector(`input[name="${name}"]`) ||
      document.querySelector(`textarea[name="${name}"]`)
    );
  }

  return { applyAnswers };
})();

window.CanvasApplicator = CanvasApplicator;
