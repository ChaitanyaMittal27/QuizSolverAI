/**
 * Generic Prompt - Complete version
 */
const GenericPrompt = {
  build(html, url) {
    return `You are a quiz structure extractor. Extract ALL questions with COMPLETE DOM attributes.

CRITICAL: Return ONLY valid JSON, NO markdown, NO explanation.

URL: ${url}
HTML:
${html}

Return this EXACT structure with ALL DOM attributes: (this is example only, adapt to actual questions found)
{
  "quizMetadata": {
    "url": "${url}",
    "platform": "generic",
    "title": "page or quiz title",
    "timestamp": "${new Date().toISOString()}"
  },
  "questions": [
    {
      "qid": "q1",
      "question_id": "dom_id_here",
      "question_class": "dom_classes_here",
      "question_name": null,
      "question_text": "Question text",
      "question_type": "radio",
      "points": null,
      "options": [
        {
          "oid": "opt1",
          "option_id": "answer_id",
          "option_class": "answer_class",
          "option_name": "name_attr",
          "option_text": "Answer text",
          "selector": "#answer_id"
        }
      ]
    },
    {
      "qid": "q2",
      "question_id": "text_question_id",
      "question_class": "text_class",
      "question_text": "Text question",
      "question_type": "text",
      "input_id": "input_id",
      "input_class": "input_class",
      "input_name": "input_name",
      "selector": "#input_id"
    }
  ]
}

RULES:
- qid: q1, q2, q3... (our sequential IDs)
- oid: opt1, opt2, opt3... (our sequential option IDs)
- Extract ALL id, class, name attributes from HTML
- question_type: "radio", "checkbox", "text", "textarea" ONLY
- Set null if attribute doesn't exist (don't omit fields)
- For radio/checkbox: include options array
- For text/textarea: include input_id, input_class, input_name, selector

Return ONLY JSON.`;
  },
};

window.GenericPrompt = GenericPrompt;
