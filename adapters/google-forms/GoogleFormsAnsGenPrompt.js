/**
 * Google Forms Answer Generation Prompt
 * Generates prompts for AI to answer Google Forms questions
 */
const GoogleFormsAnsGenPrompt = (function () {
  function generate(quizStructure) {
    const promptTemplate = `You are an expert quiz solver. Your task is to answer Google Forms questions accurately and return responses in a specific JSON format.

═══════════════════════════════════════════════════════════════════
CRITICAL INSTRUCTIONS
═══════════════════════════════════════════════════════════════════

1. ANALYZE each question carefully and provide the CORRECT answer
2. COPY all metadata fields EXACTLY as provided - especially option_value and question_id
3. DO NOT modify or generate new values - use exact values from the questions
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
  "question_id": "i5",            // Copy from question (NOT needed for radio, but include it)
  "correct_option": {             // Single object (not array!)
    "oid": "opt2",                // The oid of the correct option
    "option_id": "...",           // Copy from the correct option
    "option_name": "...",         // Copy from the correct option
    "option_class": "...",        // Copy from the correct option
    "option_text": "4",           // Copy from the correct option
    "option_value": "__option1__",// Copy from the correct option - CRITICAL!
    "selector": "..."             // Copy from the correct option
  }
}

Example:
Question:
{
  "qid": "q1",
  "question_id": "i5",
  "question_text": "What is 2+2?",
  "question_type": "radio",
  "options": [
    {"oid": "opt1", "option_text": "3", "option_value": "__option0__", ...},
    {"oid": "opt2", "option_text": "4", "option_value": "__option1__", ...},
    {"oid": "opt3", "option_text": "5", "option_value": "__option2__", ...}
  ]
}

Your response:
{
  "qid": "q1",
  "question_type": "radio",
  "question_id": "i5",
  "correct_option": {
    "oid": "opt2",
    "option_id": "i8",
    "option_name": "entry.123456789",
    "option_class": "Od2TWd hYsg7c",
    "option_text": "4",
    "option_value": "__option1__",
    "selector": "div[role=\"radio\"][data-value=\"__option1__\"]"
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
  "question_id": "i10",           // Copy from question (NOT needed for checkbox, but include it)
  "correct_options": [            // Array of objects
    {
      "oid": "opt1",              // The oid of a correct option
      "option_id": "...",         // Copy from this option
      "option_name": "...",       // Copy from this option
      "option_class": "...",      // Copy from this option
      "option_text": "2",         // Copy from this option
      "option_value": "2",        // Copy from this option - CRITICAL!
      "selector": "..."           // Copy from this option
    },
    {
      "oid": "opt2",              // Another correct option
      "option_id": "...",
      "option_name": "...",
      "option_class": "...",
      "option_text": "3",
      "option_value": "3",
      "selector": "..."
    }
    // Include ALL correct options
  ]
}

Example:
Question: "Select all prime numbers:"
Options: opt1="2" (value="2"), opt2="3" (value="3"), opt3="4" (value="4"), opt4="5" (value="5")
Correct answers: "2", "3", "5" (opt1, opt2, opt4)

Your response:
{
  "qid": "q2",
  "question_type": "checkbox",
  "question_id": "i10",
  "correct_options": [
    {
      "oid": "opt1",
      "option_id": "i15",
      "option_name": "entry.987654321",
      "option_class": "uVccjd aiSeRd",
      "option_text": "2",
      "option_value": "2",
      "selector": "div[role=\"checkbox\"][data-answer-value=\"2\"]"
    },
    {
      "oid": "opt2",
      "option_id": "i18",
      "option_name": "entry.987654321",
      "option_class": "uVccjd aiSeRd",
      "option_text": "3",
      "option_value": "3",
      "selector": "div[role=\"checkbox\"][data-answer-value=\"3\"]"
    },
    {
      "oid": "opt4",
      "option_id": "i24",
      "option_name": "entry.987654321",
      "option_class": "uVccjd aiSeRd",
      "option_text": "5",
      "option_value": "5",
      "selector": "div[role=\"checkbox\"][data-answer-value=\"5\"]"
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
  "question_id": "i20",           // Copy from question - CRITICAL! Applicator needs this!
  "input_id": "...",              // Copy from question
  "input_class": "...",           // Copy from question
  "input_name": "...",            // Copy from question
  "text_answer": "Your answer"    // YOU provide this
}

⚠️ CRITICAL: question_id is MANDATORY for text inputs!
The GoogleFormsApplicator uses question_id to locate the input field.

Example:
Question:
{
  "qid": "q3",
  "question_id": "i20",
  "question_text": "What is the capital of France?",
  "question_type": "text",
  "input_name": "entry.555666777"
}

Your response:
{
  "qid": "q3",
  "question_type": "text",
  "question_id": "i20",
  "input_id": null,
  "input_class": "whsOnd zHQkBf",
  "input_name": "entry.555666777",
  "text_answer": "Paris"
}

📌 TYPE 4: TEXTAREA (Long Answer)
─────────────────────────────────────────────────────────────────
Question has: question_type="textarea" with input metadata
Your task: Provide a detailed, well-structured answer

Answer format:
{
  "qid": "q4",                    // Copy from question
  "question_type": "textarea",    // Copy from question
  "question_id": "i25",           // Copy from question - CRITICAL! Applicator needs this!
  "input_id": "...",              // Copy from question
  "input_class": "...",           // Copy from question
  "input_name": "...",            // Copy from question
  "text_answer": "Your detailed answer..."  // YOU provide this
}

⚠️ CRITICAL: question_id is MANDATORY for textarea!
The GoogleFormsApplicator uses question_id to locate the textarea field.

Example:
Question:
{
  "qid": "q4",
  "question_id": "i25",
  "question_text": "Explain the water cycle in detail.",
  "question_type": "textarea",
  "input_name": "entry.111222333"
}

Your response:
{
  "qid": "q4",
  "question_type": "textarea",
  "question_id": "i25",
  "input_id": null,
  "input_class": "KHxj8b tL9Q4c",
  "input_name": "entry.111222333",
  "text_answer": "The water cycle consists of evaporation, condensation, precipitation, and collection. Water evaporates from bodies of water, forms clouds through condensation, falls as precipitation, and collects in rivers and oceans to repeat the cycle."
}

═══════════════════════════════════════════════════════════════════
GOOGLE FORMS SPECIFIC RULES
═══════════════════════════════════════════════════════════════════

🔴 CRITICAL FIELDS (Must copy exactly):

For RADIO/CHECKBOX:
  - option_value: Used by applicator to find elements via data-value/data-answer-value
  - selector: Pre-built selector string for DOM queries
  - All option metadata (option_id, option_name, option_class)

For TEXT/TEXTAREA:
  - question_id: MANDATORY! Applicator uses this to find the input container
  - input_name: Usually "entry.XXXXXXXXX" format
  - All input metadata (input_id, input_class)

✓ ALWAYS COPY (do not modify):
  - qid
  - question_type
  - question_id (CRITICAL for text/textarea)
  - option_value (CRITICAL for radio/checkbox)
  - All other metadata fields

✓ YOU DECIDE (based on correctness):
  - Which oid(s) to select for radio/checkbox
  - The text_answer content for text/textarea

✗ NEVER:
  - Invent new IDs or metadata
  - Modify existing field values
  - Omit question_id for text/textarea
  - Omit option_value for radio/checkbox
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
☑ Text/textarea has question_id (CRITICAL!)
☑ Text/textarea has all input fields + text_answer
☑ Radio/checkbox options have option_value
☑ All metadata copied exactly from questions
☑ No explanatory text outside the JSON

═══════════════════════════════════════════════════════════════════
COMMON MISTAKES TO AVOID
═══════════════════════════════════════════════════════════════════

❌ Forgetting question_id for text/textarea (causes failure!)
❌ Forgetting option_value for radio/checkbox (causes failure!)
❌ Using "options" instead of "correct_option" for radio (singular!)
❌ Using "correct_option" instead of "correct_options" for checkbox (plural!)
❌ Modifying option_value (must copy exactly, e.g., "__option1__")
❌ Inventing new field names not in the examples

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
window.GoogleFormsAnsGenPrompt = GoogleFormsAnsGenPrompt;
