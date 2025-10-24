/**
 * Google Forms Prompt Template
 * Site-specific prompt for Google Forms extraction
 */
const GoogleFormsPrompt = {
  build(html, url) {
    return `You are a Google Forms structure extractor. Extract ALL questions from this Google Form.

CRITICAL RULES:
1. Return ONLY valid JSON
2. NO markdown, NO code blocks, NO explanation
3. Use EXACT format specified below
4. If you cannot find a value, use null
5. Extract ALL questions in order

CURRENT URL: ${url}

HTML:
${html}

Return this EXACT JSON structure:
{
  "quizMetadata": {
    "url": "${url}",
    "platform": "google_forms",
    "title": "extract form title from page",
    "description": "extract description if present, or empty string",
    "timestamp": "${new Date().toISOString()}"
  },
  "questions": [
    {
      "qid": "q1",
      "question_id": "extract id from heading element (e.g., 'i1', 'i6')",
      "question_class": "geS5n",
      "question_name": null,
      "question_text": "What is your name?",
      "question_type": "text|paragraph|radio|checkbox",
      "required": true|false,
      "points": null|number,
      "input_id": "extract from input/textarea if present",
      "input_class": "extract from input/textarea if present",
      "input_name": "extract from input name attribute",
      "selector": "construct appropriate selector",
      "options": [...]
    }
  ]
}

QUESTION TYPES:
- "radio": Single choice (role="radiogroup" or role="radio")
- "checkbox": Multiple choice (role="checkbox")
- "text": Short answer (input[type="text"])
- "paragraph": Long answer (textarea)

FOR RADIO/CHECKBOX QUESTIONS, include "options" array:
{
  "qid": "q2",
  "question_text": "What is 2+2?",
  "question_type": "radio",
  "required": true,
  "points": 10,
  "input_name": "entry.136161915",
  "selector": "div[role='radio'][data-value]",
  "options": [
    {
      "oid": "opt1",
      "option_id": "i62",
      "option_class": "Od2TWd hYsg7c",
      "option_name": "entry.136161915",
      "option_text": "3",
      "option_value": "3",
      "selector": "div[role='radio'][data-value='3']"
    },
    {
      "oid": "opt2",
      "option_id": "i65",
      "option_class": "Od2TWd hYsg7c",
      "option_name": "entry.136161915",
      "option_text": "4",
      "option_value": "4",
      "selector": "div[role='radio'][data-value='4']"
    }
  ]
}

GOOGLE FORMS PATTERNS:
- Title: class="F9yp7e ikZYwf LgNcQe" or role="heading" aria-level="1"
- Description: class="cBGGJ OIC90c"
- Questions: class="Qr7Oae" role="listitem"
- Question text: class="M7eMe" inside role="heading" aria-level="3"
- Required: look for class="vnumgf" with text "*"
- Points: class="nUvMO FUQCPb" role="note" (e.g., "10 points")
- Radio: role="radio", data-value attribute
- Checkbox: role="checkbox", data-answer-value attribute
- Text input: input.whsOnd.zHQkBf
- Textarea: textarea.KHxj8b.tL9Q4c
- Hidden inputs: input[type="hidden"][name*="entry"] (contains the entry name)

SELECTOR CONSTRUCTION:
- Radio: "div[role='radio'][data-value='VALUE']"
- Checkbox: "div[role='checkbox'][data-answer-value='VALUE']"
- Text: "input[type='text'][name='ENTRY_NAME']"
- Paragraph: "textarea[name='ENTRY_NAME']"

Extract ALL questions. Use sequential IDs (q1, q2, q3...) and (opt1, opt2, opt3...).
Return ONLY JSON, nothing else.`;
  },
};

// Expose globally
window.GoogleFormsPrompt = GoogleFormsPrompt;
