/**
 * Answer Applicator - Fills quiz answers with proper event simulation
 */
const AnswerApplicator = (function () {
  async function applyAnswers(answerInstructions) {
    console.log("[AnswerApplicator] ✍️ Applying answers...");
    console.log("[AnswerApplicator] Total answers:", answerInstructions.answers.length);

    const results = {
      total: answerInstructions.answers.length,
      success: 0,
      failed: 0,
      details: [],
    };

    for (const answer of answerInstructions.answers) {
      try {
        console.log(`[AnswerApplicator] Processing ${answer.qid}...`);

        if (answer.question_type === "radio") {
          applyRadioAnswer(answer);
          results.success++;
        } else if (answer.question_type === "checkbox") {
          applyCheckboxAnswer(answer);
          results.success++;
        } else if (answer.question_type === "text") {
          applyTextAnswer(answer);
          results.success++;
        } else if (answer.question_type === "textarea" || answer.question_type === "paragraph") {
          applyTextareaAnswer(answer);
          results.success++;
        } else {
          throw new Error(`Unknown question type: ${answer.question_type}`);
        }

        results.details.push({ qid: answer.qid, status: "success" });
        console.log(`[AnswerApplicator] ✓ ${answer.qid} completed`);
      } catch (error) {
        console.warn(`[AnswerApplicator] ⚠️ Failed ${answer.qid}:`, error.message);
        results.failed++;
        results.details.push({ qid: answer.qid, status: "failed", error: error.message });
      }
    }

    console.log("[AnswerApplicator] ✅ Complete!");
    console.log(`[AnswerApplicator] Success: ${results.success}/${results.total}`);
    if (results.failed > 0) {
      console.warn(`[AnswerApplicator] Failed: ${results.failed}`);
    }

    return results;
  }

  function applyRadioAnswer(answer) {
    const option = answer.correct_option;
    const element =
      document.querySelector(`#${option.option_id}`) || document.querySelector(`input[name="${option.option_name}"]`);

    if (!element) throw new Error(`Radio not found for ${answer.qid}`);

    element.click();
    console.log(`[AnswerApplicator]   → Clicked: "${option.option_text}"`);
  }

  function applyCheckboxAnswer(answer) {
    console.log(`[AnswerApplicator]   → Checking ${answer.correct_options.length} options`);

    answer.correct_options.forEach((option) => {
      const element =
        document.querySelector(`#${option.option_id}`) || document.querySelector(`input[name="${option.option_name}"]`);
      if (element) {
        element.click();
        console.log(`[AnswerApplicator]   → Checked: "${option.option_text}"`);
      }
    });
  }

  function applyTextAnswer(answer) {
    const element =
      document.querySelector(`#${answer.input_id}`) || document.querySelector(`input[name="${answer.input_name}"]`);

    if (!element) throw new Error(`Text input not found for ${answer.qid}`);

    fillWithNativeEvents(element, answer.text_answer);
    console.log(`[AnswerApplicator]   → Typed: "${answer.text_answer}"`);
  }

  function applyTextareaAnswer(answer) {
    const element =
      document.querySelector(`#${answer.input_id}`) || document.querySelector(`textarea[name="${answer.input_name}"]`);

    if (!element) throw new Error(`Textarea not found for ${answer.qid}`);

    fillWithNativeEvents(element, answer.text_answer);
    const preview = answer.text_answer.substring(0, 50);
    console.log(`[AnswerApplicator]   → Typed: "${preview}..."`);
  }

  /**
   * Fill input with native events - THIS IS THE KEY FIX
   * Simulates real user typing so Canvas/React frameworks detect the change
   */
  function fillWithNativeEvents(element, value) {
    // 1. Focus
    element.focus();

    // 2. Set value
    element.value = value;

    // 3. Dispatch InputEvent (what browsers send when user types)
    const inputEvent = new InputEvent("input", {
      bubbles: true,
      cancelable: true,
      data: value,
      inputType: "insertText",
    });
    element.dispatchEvent(inputEvent);

    // 4. Dispatch change event
    const changeEvent = new Event("change", { bubbles: true });
    element.dispatchEvent(changeEvent);

    // 5. Handle Canvas TinyMCE rich text editor
    if (element.id && element.id.includes("question_input")) {
      // Update iframe if present
      const iframeId = element.id + "_ifr";
      const iframe = document.getElementById(iframeId);

      if (iframe?.contentWindow?.document?.body) {
        try {
          iframe.contentWindow.document.body.innerHTML = `<p>${value}</p>`;
        } catch (e) {
          console.warn("[AnswerApplicator]   Could not update iframe:", e.message);
        }
      }

      // Update TinyMCE editor if available
      if (window.tinymce) {
        const editor = window.tinymce.get(element.id);
        if (editor) {
          editor.setContent(`<p>${value}</p>`);
          editor.save(); // Syncs content back to textarea
        }
      }
    }

    // 6. Blur
    element.blur();
  }

  return { applyAnswers };
})();

window.AnswerApplicator = AnswerApplicator;
