/**
 * Generic Prompt Template
 * Fallback prompt for unknown/generic sites
 * Comprehensive extraction instructions for AI
 */
const GenericPrompt = {
  build(html, url) {
    return `You are a quiz structure extractor. Extract ALL questions with COMPLETE DOM attributes from this quiz page.

═══════════════════════════════════════════════════════════════════
CRITICAL RULES
═══════════════════════════════════════════════════════════════════

1. Return ONLY valid JSON - NO markdown, NO code blocks, NO explanation
2. Extract ALL id, class, and name attributes from DOM elements
3. Use sequential IDs: qid (q1, q2, q3...) and oid (opt1, opt2, opt3...)
4. Set null if attribute doesn't exist (don't omit fields)
5. The JSON must be parseable by JSON.parse()

═══════════════════════════════════════════════════════════════════
URL & HTML
═══════════════════════════════════════════════════════════════════

URL: ${url}

HTML:
${html}

═══════════════════════════════════════════════════════════════════
REQUIRED JSON STRUCTURE
═══════════════════════════════════════════════════════════════════

{
  "quizMetadata": {
    "url": "${url}",
    "platform": "generic",
    "title": "extract page or quiz title from HTML",
    "timestamp": "${new Date().toISOString()}"
  },
  "questions": [
    {
      "qid": "q1",
      "question_id": "extract DOM id attribute",
      "question_class": "extract DOM class attribute",
      "question_name": "extract DOM name attribute or null",
      "question_text": "The actual question text",
      "question_type": "radio",
      "points": null,
      "options": [
        {
          "oid": "opt1",
          "option_id": "extract option DOM id",
          "option_name": "extract option DOM name",
          "option_class": "extract option DOM class",
          "option_text": "Option text",
          "selector": "#option_id or best CSS selector"
        },
        {
          "oid": "opt2",
          "option_id": "extract option DOM id",
          "option_name": "extract option DOM name",
          "option_class": "extract option DOM class",
          "option_text": "Option text",
          "selector": "#option_id or best CSS selector"
        }
      ]
    },
    {
      "qid": "q2",
      "question_id": "extract DOM id",
      "question_class": "extract DOM class",
      "question_name": "extract DOM name or null",
      "question_text": "Text question",
      "question_type": "text",
      "points": null,
      "input_id": "extract input DOM id",
      "input_class": "extract input DOM class",
      "input_name": "extract input DOM name",
      "selector": "#input_id or best CSS selector"
    }
  ]
}

═══════════════════════════════════════════════════════════════════
QUESTION TYPES (use EXACTLY these)
═══════════════════════════════════════════════════════════════════

- "radio" = Single choice (radio buttons, true/false)
  → Include "options" array with all choices

- "checkbox" = Multiple choice (checkboxes)
  → Include "options" array with all choices

- "text" = Short text input (single line)
  → Include input_id, input_class, input_name, selector

- "textarea" = Long text input (multi-line, essay)
  → Include input_id, input_class, input_name, selector

═══════════════════════════════════════════════════════════════════
FIELD EXTRACTION GUIDELINES
═══════════════════════════════════════════════════════════════════

For ALL questions:
- qid: Sequential ID we assign (q1, q2, q3...)
- question_id: DOM id attribute (extract from <div>, <fieldset>, etc.)
- question_class: DOM class attribute (extract complete class string)
- question_name: DOM name attribute (usually null for question containers)
- question_text: The actual question being asked
- question_type: One of: "radio", "checkbox", "text", "textarea"
- points: Point value if visible (number or null)

For radio/checkbox (with options):
- options: Array of option objects
  - oid: Sequential ID we assign (opt1, opt2, opt3...)
  - option_id: DOM id of input/label/div
  - option_name: DOM name of input element (important!)
  - option_class: DOM class attribute
  - option_text: The answer choice text
  - selector: Best CSS selector to find this element

For text/textarea (no options):
- input_id: DOM id of input/textarea element
- input_class: DOM class of input element
- input_name: DOM name attribute of input (important!)
- selector: Best CSS selector to find the input

SELECTOR GUIDELINES:
- Prefer ID selectors: #element_id (most reliable)
- Fallback to name: input[name="field_name"]
- Last resort: class or attribute selectors
- Ensure document.querySelector(selector) will find the element

═══════════════════════════════════════════════════════════════════
COMMON HTML PATTERNS TO RECOGNIZE
═══════════════════════════════════════════════════════════════════

Radio buttons:
<input type="radio" id="answer1" name="question1" value="A">
<label for="answer1">Option A</label>

Checkboxes:
<input type="checkbox" id="cb1" name="question2[]" value="1">
<label for="cb1">Choice 1</label>

Text inputs:
<input type="text" id="answer3" name="question3">

Textareas:
<textarea id="essay1" name="question4"></textarea>

Custom quiz frameworks (extract from data attributes too):
<div data-question-id="q1" class="quiz-question">
  <div class="question-text">What is 2+2?</div>
  <div data-answer="A" class="answer">3</div>
  <div data-answer="B" class="answer">4</div>
</div>

═══════════════════════════════════════════════════════════════════
EXTRACTION STRATEGY
═══════════════════════════════════════════════════════════════════

1. Find all question containers (forms, fieldsets, divs with question class)
2. Extract question text (usually in h3, label, span, div.question-text)
3. Identify question type from inputs (radio, checkbox, text, textarea)
4. For radio/checkbox: extract all options with their IDs, names, classes
5. For text/textarea: extract input element attributes
6. Build best selectors for each element
7. Assign sequential qid and oid values

═══════════════════════════════════════════════════════════════════
IMPORTANT NOTES
═══════════════════════════════════════════════════════════════════

- Extract ALL questions found on the page
- Use sequential qid (q1, q2, q3...) in order they appear
- Use sequential oid (opt1, opt2, opt3...) for each question's options
- Copy complete class strings (don't truncate)
- Set fields to null if attribute doesn't exist (don't omit fields)
- Extract id attributes even if they look auto-generated
- For name attributes, extract exact value (often used for form submission)

═══════════════════════════════════════════════════════════════════
VALIDATION
═══════════════════════════════════════════════════════════════════

Before returning, verify:
☑ Valid JSON syntax (no trailing commas, proper quotes)
☑ Root has "quizMetadata" and "questions" objects
☑ Each question has qid, question_type, question_text
☑ Radio/checkbox questions have "options" array
☑ Text/textarea questions have input_id, input_name
☑ All oid values are sequential (opt1, opt2, opt3...)
☑ No markdown or explanation text

═══════════════════════════════════════════════════════════════════

Return ONLY the JSON object, nothing else:`;
  },
};

// Expose globally
window.GenericPrompt = GenericPrompt;
