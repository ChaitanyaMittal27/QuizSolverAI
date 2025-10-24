/**
 * Canvas LMS Prompt Template
 * Site-specific prompt for Canvas LMS extraction
 */
const CanvasPrompt = {
  build(html, url) {
    return `You are a Canvas LMS quiz structure extractor. Extract ALL questions with COMPLETE DOM attributes.

CRITICAL RULES:
1. Return ONLY valid JSON
2. NO markdown, NO code blocks, NO explanation
3. Extract ALL id, class, and name attributes from DOM
4. Use our internal sequential IDs (qid: q1, q2, q3... and oid: opt1, opt2, opt3...)

URL: ${url}
HTML:
${html}

Return this EXACT JSON structure:
{
  "quizMetadata": {
    "url": "${url}",
    "platform": "canvas",
    "title": "extract quiz title from page",
    "timestamp": "${new Date().toISOString()}"
  },
  "questions": [
    {
      "qid": "q1",
      "question_id": "question_123",
      "question_class": "quiz_question multiple_choice_question",
      "question_name": null,
      "question_text": "What is 2+2?",
      "question_type": "radio",
      "points": 1,
      "options": [
        {
          "oid": "opt1",
          "option_id": "answer_456",
          "option_class": "answer",
          "option_name": "question_123",
          "option_text": "3",
          "selector": "input[name='question_123'][value='456']"
        },
        {
          "oid": "opt2",
          "option_id": "answer_457",
          "option_class": "answer",
          "option_name": "question_123",
          "option_text": "4",
          "selector": "input[name='question_123'][value='457']"
        }
      ]
    },
    {
      "qid": "q2",
      "question_id": "question_124",
      "question_class": "question short_answer_question",
      "question_name": null,
      "question_text": "What is the capital of France?",
      "question_type": "text",
      "points": 2,
      "input_id": "question_124_answer",
      "input_class": "question_input",
      "input_name": "question_124",
      "selector": "#question_124_answer"
    }
  ]
}

FIELD DEFINITIONS:

For ALL questions:
- qid: Sequential ID we assign (q1, q2, q3, q4...)
- question_id: DOM id attribute (e.g., "question_123")
- question_class: DOM class attribute (full class string)
- question_name: DOM name attribute (usually null for questions, but check)
- question_text: The actual question text
- question_type: EXACTLY one of: "radio", "checkbox", "text", "textarea"
- points: Point value if visible (number or null)

For radio/checkbox questions (with options):
- options: Array of option objects
  - oid: Sequential ID we assign (opt1, opt2, opt3...)
  - option_id: DOM id attribute (e.g., "answer_456")
  - option_class: DOM class attribute
  - option_name: DOM name attribute (important for radio groups!)
  - option_text: The answer text
  - selector: Best CSS selector to click this option

For text/textarea questions (no options):
- input_id: DOM id of the input/textarea element
- input_class: DOM class of the input element
- input_name: DOM name attribute of the input
- selector: Best CSS selector for the input field

QUESTION TYPES (use EXACTLY these):
- "radio" = single choice radio buttons → we CLICK one
- "checkbox" = multiple choice checkboxes → we CLICK multiple
- "text" = short text input → we TYPE text
- "textarea" = long text area → we TYPE paragraph

CANVAS SPECIFIC PATTERNS:
- Questions have id like "question_123" or "question_456"
- Questions have class like "quiz_question" or "multiple_choice_question"
- Radio button HTML: <input type="radio" name="question_X" value="Y" id="answer_Z">
- Checkbox HTML: <input type="checkbox" name="question_X[]" value="Y" id="answer_Z">
- Text input HTML: <input type="text" name="question_X" id="question_X_answer">
- Textarea HTML: <textarea name="question_X" id="question_X_essay">
- Answers have id like "answer_456"
- Look for data-question-id attributes
- Look for .question_text or .question_prompt for question text
- Look for .answer_text for option text

SELECTOR GUIDELINES:
- For radio/checkbox: Prefer input[name='X'][value='Y'] or #answer_id
- For text/textarea: Prefer #input_id or input[name='X']
- Make sure: document.querySelector(selector) will find the element
- Use most specific selector available

IMPORTANT:
- Extract ALL questions on the page
- Use sequential qid (q1, q2, q3...) in order they appear
- Use sequential oid (opt1, opt2, opt3...) for each question's options
- Set fields to null if attribute doesn't exist (don't omit the field)
- Extract complete class strings (don't truncate)

Return ONLY the JSON object, nothing else.`;
  },
};

// Expose globally
window.CanvasPrompt = CanvasPrompt;
