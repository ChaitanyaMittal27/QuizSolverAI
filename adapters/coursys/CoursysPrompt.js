/**
 * Coursys Prompt Template
 * Site-specific prompt for CourSys extraction (SFU)
 */
const CoursysPrompt = {
  build(html, url) {
    return `You are a CourSys (SFU) form structure extractor. Extract ALL questions with COMPLETE DOM attributes.

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
    "platform": "coursys",
    "title": "extract form title from page",
    "timestamp": "${new Date().toISOString()}"
  },
  "questions": [
    {
      "qid": "q1",
      "question_id": "id_2",
      "question_class": "dlform",
      "question_name": null,
      "question_text": "Name of Nominee:",
      "question_type": "text",
      "required": true,
      "points": null,
      "input_id": "id_2",
      "input_class": "",
      "input_name": "2",
      "selector": "#id_2"
    },
    {
      "qid": "q2",
      "question_id": "id_4_0",
      "question_class": "dlform",
      "question_name": null,
      "question_text": "Nationality:",
      "question_type": "radio",
      "required": true,
      "points": null,
      "input_name": "4",
      "options": [
        {
          "oid": "opt1",
          "option_id": "id_4_0",
          "option_name": "4",
          "option_class": "",
          "option_text": "Canadian citizen",
          "option_value": "choice_1",
          "selector": "#id_4_0"
        },
        {
          "oid": "opt2",
          "option_id": "id_4_1",
          "option_name": "4",
          "option_class": "",
          "option_text": "Permanent Resident",
          "option_value": "choice_2",
          "selector": "#id_4_1"
        }
      ]
    },
    {
      "qid": "q3",
      "question_id": "id_5",
      "question_class": "dlform",
      "question_name": null,
      "question_text": "Expected start semester:",
      "question_type": "select",
      "required": true,
      "points": null,
      "input_id": "id_5",
      "input_class": "",
      "input_name": "5",
      "selector": "#id_5",
      "options": [
        {
          "oid": "opt1",
          "option_value": "1261",
          "option_text": "Spring 2026"
        },
        {
          "oid": "opt2",
          "option_value": "1264",
          "option_text": "Summer 2026"
        }
      ]
    }
  ]
}

═══════════════════════════════════════════════════════════════════
COURSYS SPECIFIC PATTERNS
═══════════════════════════════════════════════════════════════════

HTML Structure:
<dl class="dlform">
  <dt><label for="id_2">Question text:<i class="reqicon fa fa-star-o"></i></label></dt>
  <dd>
    <div class="field">
      <input type="text" name="2" id="id_2">
    </div>
  </dd>
</dl>

Key Patterns:
- Form container: <dl class="dlform">
- Questions: <dt> with <label for="id_X">
- Answers: <dd> with <div class="field">
- Required: <i class="reqicon fa fa-star-o"></i> inside label
- Question IDs: "id_2", "id_3", "id_4", etc. (numeric)
- Input names: "2", "3", "4", etc. (just numbers)
- Radio/checkbox values: "choice_1", "choice_2", "choice_3", etc.
- Radio options: id="id_4_0", id="id_4_1", id="id_4_2" (question_id + underscore + index)
- Checkbox options: Same pattern as radio
- Explanation blocks: <div class="explanation_block"> (SKIP these, not questions)
- Horizontal rules: <hr> (SKIP these, not questions)

═══════════════════════════════════════════════════════════════════
QUESTION TYPES (use EXACTLY these)
═══════════════════════════════════════════════════════════════════

- "radio" = Single choice (radio buttons)
  → Has <input type="radio">
  → Include "options" array and "input_name"

- "checkbox" = Multiple choice (checkboxes)
  → Has <input type="checkbox">
  → Include "options" array and "input_name"

- "text" = Short text input (single line)
  → Has <input type="text">
  → Include input_id, input_class, input_name, selector

- "textarea" = Long text input (multi-line)
  → Has <textarea>
  → Include input_id, input_class, input_name, selector

- "select" = Dropdown menu
  → Has <select> with <option> elements
  → Include input_id, input_class, input_name, selector, options array

- "file" = File upload
  → Has <input type="file">
  → Include input_id, input_class, input_name, selector

═══════════════════════════════════════════════════════════════════
FIELD EXTRACTION GUIDELINES
═══════════════════════════════════════════════════════════════════

For ALL questions:
- qid: Sequential ID we assign (q1, q2, q3...)
- question_id: DOM id from label's "for" attribute (e.g., "id_2")
- question_class: Use "dlform" for all CourSys questions
- question_name: Usually null for CourSys
- question_text: Text from <label> (excluding required icon)
- question_type: One of: "radio", "checkbox", "text", "textarea", "select", "file"
- required: true if <i class="reqicon"> is present, false otherwise
- points: Usually null for CourSys forms

For radio/checkbox (with options):
- input_name: The name attribute (e.g., "4")
- options: Array of option objects
  - oid: Sequential ID we assign (opt1, opt2, opt3...)
  - option_id: DOM id (e.g., "id_4_0", "id_4_1")
  - option_name: Same as input_name (e.g., "4")
  - option_class: DOM class attribute
  - option_text: The answer choice text
  - option_value: Value attribute (e.g., "choice_1", "choice_2")
  - selector: "#option_id"

For text/textarea/file (no options):
- input_id: DOM id (e.g., "id_2")
- input_class: DOM class attribute
- input_name: Name attribute (e.g., "2")
- selector: "#input_id"

For select (dropdown with options):
- input_id: DOM id of select element (e.g., "id_5")
- input_class: DOM class attribute
- input_name: Name attribute (e.g., "5")
- selector: "#input_id"
- options: Array of option objects
  - oid: Sequential ID we assign (opt1, opt2, opt3...)
  - option_value: Value attribute (e.g., "1261")
  - option_text: Display text (e.g., "Spring 2026")

═══════════════════════════════════════════════════════════════════
IMPORTANT NOTES
═══════════════════════════════════════════════════════════════════

- SKIP <div class="explanation_block"> - these are instructions, not questions
- SKIP <hr> elements - these are dividers, not questions
- Extract ALL real questions on the page in order
- Use sequential qid (q1, q2, q3...) in order they appear
- Use sequential oid (opt1, opt2, opt3...) for each question's options
- Set fields to null if attribute doesn't exist (don't omit fields)
- Required is determined by presence of <i class="reqicon fa fa-star-o"></i>
- For radio/checkbox, ALL options in a group share the same "name" attribute
- Option IDs follow pattern: id_N_M (question_N, option_M)

═══════════════════════════════════════════════════════════════════
VALIDATION
═══════════════════════════════════════════════════════════════════

Before returning, verify:
☑ Valid JSON syntax (no trailing commas, proper quotes)
☑ Root has "quizMetadata" and "questions" objects
☑ Each question has qid, question_type, question_text
☑ Radio/checkbox questions have "options" array and "input_name"
☑ Text/textarea/file questions have input_id, input_name, selector
☑ Select questions have "options" array
☑ All oid values are sequential (opt1, opt2, opt3...)
☑ No markdown or explanation text
☑ No explanation blocks or HR elements included as questions

═══════════════════════════════════════════════════════════════════

Return ONLY the JSON object, nothing else:`;
  },
};

// Expose globally
window.CoursysPrompt = CoursysPrompt;
