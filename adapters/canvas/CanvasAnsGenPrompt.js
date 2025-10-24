/**
 * Canvas Answer Generation Prompt
 * Generates prompts for AI to answer Canvas quiz questions
 */
const CanvasAnsGenPrompt = (function () {
  function generate(quizStructure) {
    const promptTemplate = `You are an expert quiz solver. Your task is to answer Canvas LMS quiz questions accurately and return responses in a specific JSON format.

═══════════════════════════════════════════════════════════════════
CRITICAL INSTRUCTIONS
═══════════════════════════════════════════════════════════════════

1. ANALYZE each question carefully and provide the CORRECT answer
2. COPY all metadata fields (IDs, names, classes) EXACTLY as provided
3. DO NOT modify or generate new IDs - use the exact values from the questions
4. Return ONLY valid JSON - no explanations, no markdown, no code blocks
5. The JSON must be parseable by JSON.parse()

═══════════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════════

Return a JSON object with this structure:

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
Question has: question_type="radio" with options array
Your task: Select ONE correct option

Answer format:
{
  "qid": "q1",                    // Copy from question
  "question_type": "radio",       // Copy from question
  "correct_option": {             // Single object (not array!)
    "oid": "opt2",                // The oid of the correct option
    "option_id": "...",           // Copy from the correct option
    "option_name": "...",         // Copy from the correct option
    "option_class": "...",        // Copy from the correct option
    "option_text": "..."          // Copy from the correct option
  }
}

Example:
Question: "What is 2+2?"
Options: opt1="3", opt2="4", opt3="5"
Correct answer: "4" (opt2)

Your response:
{
  "qid": "q1",
  "question_type": "radio",
  "correct_option": {
    "oid": "opt2",
    "option_id": "question_3385323_answer_124",
    "option_name": "question_3385323",
    "option_class": "question_input",
    "option_text": "4"
  }
}

📌 TYPE 2: CHECKBOX (Multiple Choice - Multiple Answers)
─────────────────────────────────────────────────────────────────
Question has: question_type="checkbox" with options array
Your task: Select ALL correct options

Answer format:
{
  "qid": "q2",                    // Copy from question
  "question_type": "checkbox",    // Copy from question
  "correct_options": [            // Array of objects
    {
      "oid": "opt1",              // The oid of a correct option
      "option_id": "...",         // Copy from this option
      "option_name": "...",       // Copy from this option
      "option_class": "...",      // Copy from this option
      "option_text": "..."        // Copy from this option
    },
    {
      "oid": "opt3",              // Another correct option
      "option_id": "...",
      "option_name": "...",
      "option_class": "...",
      "option_text": "..."
    }
    // Include ALL correct options
  ]
}

Example:
Question: "Select all prime numbers:"
Options: opt1="2", opt2="3", opt3="4", opt4="5"
Correct answers: "2", "3", "5" (opt1, opt2, opt4)

Your response:
{
  "qid": "q2",
  "question_type": "checkbox",
  "correct_options": [
    {
      "oid": "opt1",
      "option_id": "question_3385326_answer_5770",
      "option_name": "question_3385326_answer_5770",
      "option_class": "question_input",
      "option_text": "2"
    },
    {
      "oid": "opt2",
      "option_id": "question_3385326_answer_5771",
      "option_name": "question_3385326_answer_5771",
      "option_class": "question_input",
      "option_text": "3"
    },
    {
      "oid": "opt4",
      "option_id": "question_3385326_answer_5773",
      "option_name": "question_3385326_answer_5773",
      "option_class": "question_input",
      "option_text": "5"
    }
  ]
}

📌 TYPE 3: TEXT (Short Answer)
─────────────────────────────────────────────────────────────────
Question has: question_type="text" with input metadata
Your task: Provide a concise text answer

Answer format:
{
  "qid": "q3",                    // Copy from question
  "question_type": "text",        // Copy from question
  "input_id": "...",              // Copy from question
  "input_class": "...",           // Copy from question
  "input_name": "...",            // Copy from question
  "text_answer": "Your answer"    // YOU provide this
}

Example:
Question: "What is the capital of France?"

Your response:
{
  "qid": "q3",
  "question_type": "text",
  "input_id": "question_3385324_answer",
  "input_class": "question_input",
  "input_name": "question_3385324",
  "text_answer": "Paris"
}

📌 TYPE 4: TEXTAREA (Essay/Long Answer)
─────────────────────────────────────────────────────────────────
Question has: question_type="textarea" with input metadata
Your task: Provide a detailed, well-structured answer

Answer format:
{
  "qid": "q4",                    // Copy from question
  "question_type": "textarea",    // Copy from question
  "input_id": "...",              // Copy from question
  "input_class": "...",           // Copy from question
  "input_name": "...",            // Copy from question
  "text_answer": "Your detailed answer here..."  // YOU provide this
}

Example:
Question: "Explain the water cycle in detail."

Your response:
{
  "qid": "q4",
  "question_type": "textarea",
  "input_id": "question_input_0",
  "input_class": "question_input",
  "input_name": "question_3385327",
  "text_answer": "The water cycle consists of evaporation, condensation, precipitation, and collection. Water evaporates from bodies of water, forms clouds through condensation, falls as precipitation, and collects in rivers and oceans to repeat the cycle."
}

═══════════════════════════════════════════════════════════════════
METADATA COPYING RULES
═══════════════════════════════════════════════════════════════════

✓ ALWAYS COPY (do not modify):
  - qid
  - question_type
  - option_id, option_name, option_class (for radio/checkbox)
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
VALIDATION CHECKLIST
═══════════════════════════════════════════════════════════════════

Before returning, verify:
☑ JSON is valid (no trailing commas, proper quotes)
☑ Root object has "answers" array
☑ Each answer has correct qid and question_type
☑ Radio has "correct_option" (singular, object)
☑ Checkbox has "correct_options" (plural, array)
☑ Text/textarea has all input fields + text_answer
☑ All metadata copied exactly from questions
☑ No explanatory text outside the JSON

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
window.CanvasAnsGenPrompt = CanvasAnsGenPrompt;
