/**
 * AI Answer Generator
 * Generates correct answers for quiz questions using AI
 * Generic service - works with any quiz structure
 */
const AIAnswerGenerator = (function () {
  /**
   * Generate answers for quiz questions
   * @param {Object} quizStructure - Quiz structure from extraction phase
   * @param {Object} aiService - AI service (GeminiService)
   * @returns {Promise<Object>} Answer instructions
   */
  async function generateAnswers(quizStructure, aiService) {
    console.log("[AnswerGenerator] 🧠 Generating answers...");
    console.log("[AnswerGenerator] Questions to solve:", quizStructure.questions.length);

    try {
      // 1. Build prompt with questions
      const prompt = buildPrompt(quizStructure);

      // 2. Send to AI
      const response = await aiService.query(prompt, {
        temperature: 0.3,
        maxTokens: 40002,
      });

      console.log("[AnswerGenerator] AI response received");
      console.log("[AnswerGenerator] Raw response:", response);

      // 3. Clean & parse JSON
      let cleaned = response
        .trim()
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      let answerInstructions = JSON.parse(cleaned);
      // Fix: AI sometimes returns array directly instead of {answers: [...]}
      if (Array.isArray(answerInstructions)) {
        answerInstructions = { answers: answerInstructions };
      }
      // DEBUG - See what AI returned
      console.log("[AnswerGenerator] 🔍 Parsed structure:", JSON.stringify(answerInstructions, null, 2));
      console.log("[AnswerGenerator] Has answers?", answerInstructions?.answers);
      console.log("[AnswerGenerator] Is array?", Array.isArray(answerInstructions?.answers));

      // 4. Validate
      if (!answerInstructions?.answers || !Array.isArray(answerInstructions.answers)) {
        throw new Error("Invalid answer structure");
      }

      if (answerInstructions.answers.length === 0) {
        throw new Error("No answers generated");
      }

      console.log("[AnswerGenerator] ✅ Answers generated successfully");
      console.log("[AnswerGenerator] Generated answers:", answerInstructions);
      return answerInstructions;
    } catch (error) {
      console.error("[AnswerGenerator] ❌ Failed:", error.message);
      throw error;
    }
  }

  /**
   * Build prompt for AI answer generation
   */
  function buildPrompt(quizStructure) {
    return `You are an expert quiz solver. Analyze these questions and determine the correct answers.

CRITICAL RULES:
1. Return ONLY valid JSON
2. NO markdown, NO code blocks, NO explanation
3. Match the EXACT format below
4. Answer ALL questions
5. Copy option details exactly (don't recreate)

QUESTIONS TO SOLVE:
${JSON.stringify(quizStructure.questions, null, 2)}

Return in this EXACT format (adapt to match question count and types from input):
{
  "answers": [
    {
      "qid": "q1",
      "question_type": "radio",
      "correct_option": {
        "oid": "opt3",
        "option_id": "question_3385323_answer_64796",
        "option_class": "answer",
        "option_name": "question_3385323",
        "option_text": "3"
      }
    },
    {
      "qid": "q2",
      "question_type": "text",
      "input_id": "question_124_answer",
      "input_class": "question_input",
      "input_name": "question_124",
      "text_answer": "Paris"
    },
    {
      "qid": "q3",
      "question_type": "checkbox",
      "correct_options": [
        {
          "oid": "opt1",
          "option_id": "answer_501",
          "option_class": "answer",
          "option_name": "question_125[]",
          "option_text": "2"
        },
        {
          "oid": "opt3",
          "option_id": "answer_503",
          "option_class": "answer",
          "option_name": "question_125[]",
          "option_text": "4"
        }
      ]
    },
    {
      "qid": "q4",
      "question_type": "textarea",
      "input_id": "question_126_essay",
      "input_class": "essay_textarea",
      "input_name": "question_126",
      "text_answer": "Detailed explanation..."
    }
  ]
}

ANSWER RULES:

RADIO (single choice):
- Return ONE correct option
- Copy COMPLETE option object from question (oid, option_id, option_class, option_name, option_text)
- Pick the option that is factually correct

CHECKBOX (multiple choice):
- Return ALL correct options in array
- Copy COMPLETE option objects from question
- Include all that are factually correct

TEXT (short answer):
- Provide concise answer (1-50 words)
- Copy ALL input fields from question (input_id, input_class, input_name)
- Give factually correct answer

textarea/TEXTAREA (long answer):
- Provide detailed answer
- Copy ALL input fields from question
- Give comprehensive, factually correct answer

CRITICAL:
- Answer count must match question count
- Match qid exactly from questions
- Copy question_type exactly
- For radio/checkbox: Copy entire option object, don't modify
- For text/textarea: Copy all input fields, don't modify
- Use your knowledge to determine correctness
- Make educated guesses if uncertain

Return ONLY JSON, nothing else.`;
  }

  return {
    generateAnswers,
  };
})();

// Expose globally
window.AIAnswerGenerator = AIAnswerGenerator;
