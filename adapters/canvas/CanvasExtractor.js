/**
 * Canvas Extractor - Manual DOM extraction
 */
const CanvasExtractor = (function () {
  async function extractStructure(html, url) {
    console.log("[CanvasExtractor] Starting manual extraction...");

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Canvas structure: form#submit_quiz_form > div#questions
    const questionsDiv = doc.querySelector("#questions");
    if (!questionsDiv) {
      console.log("[CanvasExtractor] No #questions div found");
      return null;
    }

    const questions = [];
    const questionDivs = questionsDiv.querySelectorAll(".display_question");

    console.log(`[CanvasExtractor] Found ${questionDivs.length} question divs`);

    questionDivs.forEach((div, idx) => {
      const questionId = div.id; // e.g., "question_3385327"
      const questionText = div.querySelector(".question_text")?.textContent.trim();

      if (!questionText) return;

      const question = {
        qid: `q${idx + 1}`,
        question_id: questionId,
        question_class: div.className,
        question_name: null,
        question_text: questionText,
        question_type: null,
        points: null,
      };

      // Get points if available
      const pointsEl = div.querySelector(".question_points");
      if (pointsEl) question.points = parseInt(pointsEl.textContent);

      // Look inside .answers to detect question type
      const answers = div.querySelector(".answers");
      if (!answers) return;

      // Radio buttons (multiple choice or true/false)
      const radios = answers.querySelectorAll("input[type='radio']");
      if (radios.length > 0) {
        question.question_type = "radio";
        question.options = [];

        radios.forEach((radio, i) => {
          const label = div.querySelector(`label[for="${radio.id}"]`);
          question.options.push({
            oid: `opt${i + 1}`,
            option_id: radio.id,
            option_name: radio.name,
            option_class: radio.className,
            option_text: label?.textContent.trim() || `Option ${i + 1}`,
          });
        });
      }

      // Checkboxes (multiple answers)
      else if (answers.querySelectorAll("input[type='checkbox']").length > 0) {
        const checkboxes = answers.querySelectorAll("input[type='checkbox']");
        question.question_type = "checkbox";
        question.options = [];

        checkboxes.forEach((checkbox, i) => {
          const labelId = checkbox.getAttribute("aria-labelledby");
          const label = labelId ? div.querySelector(`#${labelId}`) : null;
          question.options.push({
            oid: `opt${i + 1}`,
            option_id: checkbox.id,
            option_name: checkbox.name,
            option_class: checkbox.className,
            option_text: label?.textContent.trim() || `Option ${i + 1}`,
          });
        });
      }

      // Textarea (essay)
      else if (answers.querySelector("textarea")) {
        question.question_type = "textarea";
        const textarea = answers.querySelector("textarea");
        question.input_id = textarea.id;
        question.input_name = textarea.name || questionId;
        question.input_class = textarea.className;
      }

      // Text input (short answer)
      else if (answers.querySelector("input[type='text']")) {
        question.question_type = "text";
        const input = answers.querySelector("input[type='text']");
        question.input_id = input.id;
        question.input_name = input.name || questionId;
        question.input_class = input.className;
      }

      if (question.question_type) {
        questions.push(question);
      }
    });

    if (questions.length === 0) {
      console.log("[CanvasExtractor] No valid questions extracted");
      return null;
    }

    console.log(`[CanvasExtractor] ✅ Extracted ${questions.length} questions`);
    // log questions for debugging
    console.log(questions);

    return {
      quizMetadata: {
        url: url,
        platform: "canvas",
        title: "Canvas Quiz",
        timestamp: new Date().toISOString(),
      },
      questions: questions,
    };
  }
  return { extractStructure };
})();

window.CanvasExtractor = CanvasExtractor;
