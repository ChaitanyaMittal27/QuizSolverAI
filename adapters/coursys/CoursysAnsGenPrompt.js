/**
 * Coursys Answer Generation Prompt
 * Generates prompts for AI to answer CourSys form questions
 */
const CoursysAnsGenPrompt = (function () {
  function generate(quizStructure) {
    const promptTemplate = `You are an expert form solver. Answer the following CourSys (SFU) form questions accurately and return responses in JSON format.

═══════════════════════════════════════════════════════════════════
CRITICAL INSTRUCTIONS
═══════════════════════════════════════════════════════════════════

1. ANALYZE each question carefully and provide the CORRECT answer
2. COPY all metadata fields (IDs, names, classes) EXACTLY as provided
3. DO NOT modify or generate new IDs - use exact values from questions
4. Return ONLY valid JSON - no explanations, no markdown, no code blocks
5. The JSON must be parseable by JSON.parse()

═══════════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════════

{
  "answers": [
    // Array of answer objects, one per question
  ]
}

═══════════════════════════════════════════════════════════════════
QUESTION TYPES & ANSWER FORMATS
═══════════════════════════════════════════════════════════════════

📌 TYPE 1: RADIO (Single Choice)
─────────────────────────────────────────────────────────────────
Answer format:
{
  "qid": "q1",
  "question_type": "radio",
  "correct_option": {
    "oid": "opt2",
    "option_id": "id_4_1",
    "option_name": "4",
    "option_class": "",
    "option_text": "Permanent Resident",
    "option_value": "choice_2",
    "selector": "#id_4_1"
  }
}

📌 TYPE 2: CHECKBOX (Multiple Choice)
─────────────────────────────────────────────────────────────────
Answer format:
{
  "qid": "q2",
  "question_type": "checkbox",
  "correct_options": [
    {
      "oid": "opt1",
      "option_id": "id_5_0",
      "option_name": "5",
      "option_class": "",
      "option_text": "CMPT 740",
      "option_value": "choice_1",
      "selector": "#id_5_0"
    },
    {
      "oid": "opt3",
      "option_id": "id_5_2",
      "option_name": "5",
      "option_class": "",
      "option_text": "CMPT 842",
      "option_value": "choice_3",
      "selector": "#id_5_2"
    }
  ]
}

📌 TYPE 3: TEXT (Short Answer)
─────────────────────────────────────────────────────────────────
Answer format:
{
  "qid": "q3",
  "question_type": "text",
  "input_id": "id_2",
  "input_class": "",
  "input_name": "2",
  "selector": "#id_2",
  "text_answer": "Your answer here"
}

📌 TYPE 4: TEXTAREA (Long Answer)
─────────────────────────────────────────────────────────────────
Answer format:
{
  "qid": "q4",
  "question_type": "textarea",
  "input_id": "id_7",
  "input_class": "",
  "input_name": "7",
  "selector": "#id_7",
  "text_answer": "Your detailed answer here..."
}

📌 TYPE 5: SELECT (Dropdown)
─────────────────────────────────────────────────────────────────
Answer format:
{
  "qid": "q5",
  "question_type": "select",
  "input_id": "id_5",
  "input_class": "",
  "input_name": "5",
  "selector": "#id_5",
  "selected_option": {
    "oid": "opt2",
    "option_value": "1264",
    "option_text": "Summer 2026"
  }
}

📌 TYPE 6: FILE (File Upload)
─────────────────────────────────────────────────────────────────
⚠️ SKIP FILE UPLOAD QUESTIONS - Cannot be filled programmatically
Do NOT include file upload questions in your answer array.

═══════════════════════════════════════════════════════════════════
METADATA COPYING RULES
═══════════════════════════════════════════════════════════════════

✓ ALWAYS COPY (do not modify):
  - qid
  - question_type
  - option_id, option_name, option_class, option_value, selector (for radio/checkbox)
  - input_id, input_class, input_name, selector (for text/textarea/select)

✓ YOU DECIDE (based on correctness):
  - Which oid(s) to select for radio/checkbox
  - Which option to select for select (dropdown)
  - The text_answer content for text/textarea

✗ NEVER:
  - Invent new IDs or metadata
  - Modify existing field values
  - Add fields not in the format above
  - Include markdown or explanations
  - Include file upload questions

═══════════════════════════════════════════════════════════════════
COURSYS SPECIFIC NOTES
═══════════════════════════════════════════════════════════════════

- Question IDs use pattern: id_N (e.g., id_2, id_3, id_4)
- Input names are just numbers: "2", "3", "4"
- Radio/checkbox option IDs: id_N_M (e.g., id_4_0, id_4_1)
- Option values: "choice_1", "choice_2", "choice_3"
- Select option values: Usually numeric (e.g., "1261", "1264")
- Selectors: Use "#id" format for all elements

═══════════════════════════════════════════════════════════════════
VALIDATION CHECKLIST
═══════════════════════════════════════════════════════════════════

☑ JSON is valid (no trailing commas, proper quotes)
☑ Root object has "answers" array
☑ Each answer has qid and question_type
☑ Radio has "correct_option" (singular, object)
☑ Checkbox has "correct_options" (plural, array)
☑ Text/textarea has input fields + text_answer
☑ Select has "selected_option" with option_value
☑ All metadata copied exactly
☑ No file upload questions included
☑ No explanatory text outside JSON

═══════════════════════════════════════════════════════════════════
QUESTIONS TO ANSWER
═══════════════════════════════════════════════════════════════════

${JSON.stringify(quizStructure.questions, null, 2)}

═══════════════════════════════════════════════════════════════════
YOUR RESPONSE
═══════════════════════════════════════════════════════════════════

Return the JSON now (and ONLY the JSON):`;

    return promptTemplate;
  }

  return generate;
})();

// Expose globally
window.CoursysAnsGenPrompt = CoursysAnsGenPrompt;
