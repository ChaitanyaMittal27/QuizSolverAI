/**
 * Generic Answer Generation Prompt
 * Fallback prompt for unknown/generic quiz sites
 * Uses Canvas-like structure as it's the most standard
 */
const GenericAnsGenPrompt = (function () {
  function generate(quizStructure) {
    const promptTemplate = `You are an expert quiz solver. Answer the following quiz questions accurately and return responses in JSON format.

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

📌 TYPE 1: RADIO (Multiple Choice - Single Answer)
─────────────────────────────────────────────────────────────────
Answer format:
{
  "qid": "q1",
  "question_type": "radio",
  "correct_option": {
    "oid": "opt2",
    "option_id": "answer_456",
    "option_name": "question_123",
    "option_class": "answer",
    "option_text": "4"
  }
}

📌 TYPE 2: CHECKBOX (Multiple Choice - Multiple Answers)
─────────────────────────────────────────────────────────────────
Answer format:
{
  "qid": "q2",
  "question_type": "checkbox",
  "correct_options": [
    {
      "oid": "opt1",
      "option_id": "answer_789",
      "option_name": "question_124",
      "option_class": "answer",
      "option_text": "2"
    },
    {
      "oid": "opt3",
      "option_id": "answer_791",
      "option_name": "question_124",
      "option_class": "answer",
      "option_text": "4"
    }
  ]
}

📌 TYPE 3: TEXT (Short Answer)
─────────────────────────────────────────────────────────────────
Answer format:
{
  "qid": "q3",
  "question_type": "text",
  "input_id": "input_125",
  "input_class": "text_input",
  "input_name": "question_125",
  "text_answer": "Paris"
}

📌 TYPE 4: TEXTAREA (Essay/Long Answer)
─────────────────────────────────────────────────────────────────
Answer format:
{
  "qid": "q4",
  "question_type": "textarea",
  "input_id": "textarea_126",
  "input_class": "essay_input",
  "input_name": "question_126",
  "text_answer": "The water cycle consists of evaporation, condensation, precipitation, and collection. Water evaporates from bodies of water, forms clouds through condensation, falls as precipitation, and collects in rivers and oceans to repeat the cycle."
}

═══════════════════════════════════════════════════════════════════
METADATA COPYING RULES
═══════════════════════════════════════════════════════════════════

✓ ALWAYS COPY (do not modify):
  - qid (from question)
  - question_type (from question)
  - option_id, option_name, option_class (for radio/checkbox options)
  - input_id, input_class, input_name (for text/textarea)

✓ YOU DECIDE (based on correctness):
  - Which oid(s) to select for radio/checkbox
  - The text_answer content for text/textarea

✗ NEVER:
  - Invent new IDs or metadata
  - Modify existing field values
  - Add fields not in the format above
  - Include markdown or explanations

═══════════════════════════════════════════════════════════════════
IMPORTANT NOTES
═══════════════════════════════════════════════════════════════════

- For RADIO: use "correct_option" (singular) - single object
- For CHECKBOX: use "correct_options" (plural) - array of objects
- Copy ALL metadata from questions exactly as provided
- Use sequential oids (opt1, opt2, opt3...) that match the question data
- Set fields to null if they don't exist in the question data

═══════════════════════════════════════════════════════════════════
VALIDATION CHECKLIST
═══════════════════════════════════════════════════════════════════

☑ JSON is valid (no trailing commas, proper quotes)
☑ Root object has "answers" array
☑ Each answer has qid and question_type
☑ Radio has "correct_option" (singular, object not array)
☑ Checkbox has "correct_options" (plural, array)
☑ Text/textarea has input fields + text_answer
☑ All metadata copied exactly
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
window.GenericAnsGenPrompt = GenericAnsGenPrompt;
