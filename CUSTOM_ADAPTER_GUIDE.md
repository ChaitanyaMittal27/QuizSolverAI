# Creating Custom Adapters for New Quiz Sites

## 📚 Complete Guide to Extending Quiz Solver

This guide will teach you how to add support for **any quiz platform** to the Quiz Solver extension.

---

## 🏗️ Architecture Overview

The Quiz Solver uses an **Adapter Pattern** with 4 components per platform:

```
┌─────────────────────────────────────────────────────────────┐
│                    ADAPTER ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────┘

1. PROMPT (AI Extraction)
   └─ Teaches AI how to extract quiz structure from HTML

2. EXTRACTOR (Manual/AI)
   └─ Parses DOM to extract questions, options, input fields

3. ANSWER GENERATION PROMPT
   └─ Teaches AI how to answer questions for this platform

4. APPLICATOR (DOM Manipulation)
   └─ Fills form fields with answers
```

Each platform has its own folder in `/adapters/`:

```
adapters/
├── canvas/
│   ├── CanvasPrompt.js
│   ├── CanvasExtractor.js
│   ├── CanvasAnsGenPrompt.js
│   └── CanvasApplicator.js
├── google-forms/
│   ├── GoogleFormsPrompt.js
│   ├── GoogleFormsExtractor.js
│   ├── GoogleFormsAnsGenPrompt.js
│   └── GoogleFormsApplicator.js
└── your-platform/      ← ADD YOUR ADAPTER HERE
    ├── YourPlatformPrompt.js
    ├── YourPlatformExtractor.js
    ├── YourPlatformAnsGenPrompt.js
    └── YourPlatformApplicator.js
```

---

## 🎯 Step-by-Step: Adding a New Platform

### Example: Adding Support for "Blackboard LMS"

We'll create a complete Blackboard adapter from scratch.

---

## STEP 1: Analyze the Platform's HTML Structure

### 1.1 Open Developer Tools

Navigate to a quiz on the platform and open DevTools (`F12`).

### 1.2 Identify Key Elements

Look for:

- **Quiz container** - Main div/form containing all questions
- **Question containers** - Divs/fieldsets for each question
- **Question text** - Where the question is displayed
- **Input types** - Radio, checkbox, text, textarea
- **IDs and Classes** - Unique identifiers for elements

### 1.3 Document Patterns

Create a document like this:

````markdown
## Blackboard HTML Patterns

### Quiz Container

- Selector: `#content_listContainer`
- Structure: `<div id="content_listContainer">`

### Question Container

- Selector: `.vtbegenerated`
- Structure: `<div class="vtbegenerated">`
- Question ID: `data-qid` attribute

### Question Types

#### Multiple Choice (Radio)

```html
<div class="vtbegenerated" data-qid="12345">
  <legend class="question_text">What is 2+2?</legend>
  <input type="radio" name="answer_12345" value="1" id="ans_1" />
  <label for="ans_1">3</label>
  <input type="radio" name="answer_12345" value="2" id="ans_2" />
  <label for="ans_2">4</label>
</div>
```
````

#### Text Input

```html
<div class="vtbegenerated" data-qid="12346">
  <legend class="question_text">What is the capital of France?</legend>
  <input type="text" name="answer_12346" id="text_12346" />
</div>
```

````

---

## STEP 2: Create the Prompt Template

File: `adapters/blackboard/BlackboardPrompt.js`

```javascript
/**
 * Blackboard LMS Prompt Template
 * Teaches AI how to extract Blackboard quiz structure
 */
const BlackboardPrompt = {
  build(html, url) {
    return `You are a Blackboard LMS quiz structure extractor. Extract ALL questions with COMPLETE DOM attributes.

CRITICAL RULES:
1. Return ONLY valid JSON
2. NO markdown, NO code blocks, NO explanation
3. Extract ALL id, class, and name attributes from DOM
4. Use sequential IDs (qid: q1, q2, q3... and oid: opt1, opt2, opt3...)

URL: ${url}

HTML:
${html}

Return this EXACT JSON structure:
{
  "quizMetadata": {
    "url": "${url}",
    "platform": "blackboard",
    "title": "extract quiz title",
    "timestamp": "${new Date().toISOString()}"
  },
  "questions": [
    {
      "qid": "q1",
      "question_id": "extract data-qid or id attribute",
      "question_class": "vtbegenerated",
      "question_name": null,
      "question_text": "What is 2+2?",
      "question_type": "radio",
      "points": null,
      "options": [
        {
          "oid": "opt1",
          "option_id": "ans_1",
          "option_name": "answer_12345",
          "option_class": "answer-option",
          "option_text": "3",
          "selector": "#ans_1"
        },
        {
          "oid": "opt2",
          "option_id": "ans_2",
          "option_name": "answer_12345",
          "option_class": "answer-option",
          "option_text": "4",
          "selector": "#ans_2"
        }
      ]
    }
  ]
}

BLACKBOARD SPECIFIC PATTERNS:
- Questions have data-qid attribute
- Question text in .question_text or legend
- Radio buttons have name="answer_XXXXX"
- Container class: .vtbegenerated
- Look for id="content_listContainer"

Return ONLY the JSON object, nothing else.`;
  },
};

// Expose globally
window.BlackboardPrompt = BlackboardPrompt;
````

**Key Points:**

- Include platform-specific HTML patterns
- Provide example JSON structure
- Emphasize critical fields (IDs, names, classes)
- Request ONLY JSON output

---

## STEP 3: Create the Extractor

File: `adapters/blackboard/BlackboardExtractor.js`

### Option A: Manual Extractor (Recommended for Reliability)

```javascript
/**
 * Blackboard Extractor - Manual DOM extraction
 */
const BlackboardExtractor = (function () {
  async function extractStructure(html, url) {
    console.log("[BlackboardExtractor] Starting manual extraction...");

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Find Blackboard quiz container
    const container = doc.querySelector("#content_listContainer");
    if (!container) {
      console.log("[BlackboardExtractor] No quiz container found");
      return null;
    }

    const questions = [];
    const questionDivs = container.querySelectorAll(".vtbegenerated");

    console.log(`[BlackboardExtractor] Found ${questionDivs.length} questions`);

    questionDivs.forEach((div, idx) => {
      const questionId = div.getAttribute("data-qid") || div.id;
      const questionTextEl = div.querySelector(".question_text, legend");
      const questionText = questionTextEl?.textContent.trim();

      if (!questionText) return;

      const question = {
        qid: `q${idx + 1}`,
        question_id: questionId,
        question_class: div.className,
        question_name: null,
        question_text: questionText,
        question_type: null,
        points: null,
      };

      // Detect question type
      const radios = div.querySelectorAll("input[type='radio']");
      const checkboxes = div.querySelectorAll("input[type='checkbox']");
      const textInput = div.querySelector("input[type='text']");
      const textarea = div.querySelector("textarea");

      if (radios.length > 0) {
        question.question_type = "radio";
        question.options = [];

        radios.forEach((radio, i) => {
          const label = div.querySelector(`label[for="${radio.id}"]`);
          question.options.push({
            oid: `opt${i + 1}`,
            option_id: radio.id,
            option_name: radio.name,
            option_class: radio.className,
            option_text: label?.textContent.trim() || `Option ${i + 1}`,
          });
        });
      } else if (checkboxes.length > 0) {
        question.question_type = "checkbox";
        question.options = [];

        checkboxes.forEach((checkbox, i) => {
          const label = div.querySelector(`label[for="${checkbox.id}"]`);
          question.options.push({
            oid: `opt${i + 1}`,
            option_id: checkbox.id,
            option_name: checkbox.name,
            option_class: checkbox.className,
            option_text: label?.textContent.trim() || `Option ${i + 1}`,
          });
        });
      } else if (textarea) {
        question.question_type = "textarea";
        question.input_id = textarea.id;
        question.input_name = textarea.name;
        question.input_class = textarea.className;
      } else if (textInput) {
        question.question_type = "text";
        question.input_id = textInput.id;
        question.input_name = textInput.name;
        question.input_class = textInput.className;
      }

      if (question.question_type) {
        questions.push(question);
      }
    });

    if (questions.length === 0) {
      console.log("[BlackboardExtractor] No valid questions extracted");
      return null;
    }

    console.log(`[BlackboardExtractor] ✅ Extracted ${questions.length} questions`);

    return {
      quizMetadata: {
        url: url,
        platform: "blackboard",
        title: "Blackboard Quiz",
        timestamp: new Date().toISOString(),
      },
      questions: questions,
    };
  }

  return { extractStructure };
})();

window.BlackboardExtractor = BlackboardExtractor;
```

### Option B: AI-Only Extractor (Fallback)

````javascript
/**
 * Blackboard Extractor - AI-based extraction
 */
const BlackboardExtractor = (function () {
  async function extractStructure(html, url, aiService) {
    console.log("[BlackboardExtractor] Using AI extraction...");

    const prompt = window.BlackboardPrompt.build(html, url);
    const response = await aiService.query(prompt, {
      temperature: 0.1,
      maxTokens: 4096,
    });

    let cleaned = response
      .trim()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const structure = JSON.parse(cleaned);

    if (!structure?.questions || structure.questions.length === 0) {
      throw new Error("No questions found");
    }

    return structure;
  }

  return { extractStructure };
})();

window.BlackboardExtractor = BlackboardExtractor;
````

**Best Practice:** Use Manual extractor with AI fallback (see AdapterRouter pattern).

---

## STEP 4: Create the Answer Generation Prompt

File: `adapters/blackboard/BlackboardAnsGenPrompt.js`

```javascript
/**
 * Blackboard Answer Generation Prompt
 */
const BlackboardAnsGenPrompt = (function () {
  function generate(quizStructure) {
    const promptTemplate = `You are an expert quiz solver. Answer Blackboard LMS quiz questions accurately and return responses in JSON format.

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
    "option_id": "ans_2",
    "option_name": "answer_12345",
    "option_class": "answer-option",
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
      "option_id": "ans_1",
      "option_name": "answer_12346",
      "option_class": "answer-option",
      "option_text": "2"
    },
    {
      "oid": "opt2",
      "option_id": "ans_2",
      "option_name": "answer_12346",
      "option_class": "answer-option",
      "option_text": "3"
    }
  ]
}

📌 TYPE 3: TEXT (Short Answer)
─────────────────────────────────────────────────────────────────
Answer format:
{
  "qid": "q3",
  "question_type": "text",
  "input_id": "text_12347",
  "input_class": "text-input",
  "input_name": "answer_12347",
  "text_answer": "Paris"
}

📌 TYPE 4: TEXTAREA (Essay/Long Answer)
─────────────────────────────────────────────────────────────────
Answer format:
{
  "qid": "q4",
  "question_type": "textarea",
  "input_id": "textarea_12348",
  "input_class": "essay-input",
  "input_name": "answer_12348",
  "text_answer": "The water cycle consists of evaporation, condensation, precipitation, and collection..."
}

═══════════════════════════════════════════════════════════════════
BLACKBOARD SPECIFIC RULES
═══════════════════════════════════════════════════════════════════

✓ ALWAYS COPY:
  - qid (from question)
  - question_type (from question)
  - option_id, option_name, option_class (for radio/checkbox)
  - input_id, input_name, input_class (for text/textarea)

✓ YOU DECIDE:
  - Which oid(s) to select for radio/checkbox
  - The text_answer content for text/textarea

✗ NEVER:
  - Invent new IDs or metadata
  - Modify existing field values

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

window.BlackboardAnsGenPrompt = BlackboardAnsGenPrompt;
```

---

## STEP 5: Create the Applicator

File: `adapters/blackboard/BlackboardApplicator.js`

```javascript
/**
 * Blackboard Applicator - Fills quiz answers
 */
const BlackboardApplicator = (function () {
  async function applyAnswers(answerInstructions) {
    console.log("[BlackboardApplicator] ✏️ Applying answers...");
    console.log("[BlackboardApplicator] Total answers:", answerInstructions.answers.length);

    const results = {
      total: answerInstructions.answers.length,
      success: 0,
      failed: 0,
      details: [],
    };

    for (const answer of answerInstructions.answers) {
      try {
        console.log(`[BlackboardApplicator] Processing ${answer.qid}...`);

        if (answer.question_type === "radio") {
          applyRadio(answer);
        } else if (answer.question_type === "checkbox") {
          applyCheckbox(answer);
        } else if (answer.question_type === "text") {
          applyText(answer);
        } else if (answer.question_type === "textarea") {
          applyTextarea(answer);
        } else {
          throw new Error(`Unknown type: ${answer.question_type}`);
        }

        results.success++;
        results.details.push({ qid: answer.qid, status: "success" });
        console.log(`[BlackboardApplicator] ✓ ${answer.qid} completed`);
      } catch (error) {
        console.warn(`[BlackboardApplicator] ⚠️ Failed ${answer.qid}:`, error.message);
        results.failed++;
        results.details.push({ qid: answer.qid, status: "failed", error: error.message });
      }
    }

    console.log(`[BlackboardApplicator] ✅ Success: ${results.success}/${results.total}`);
    return results;
  }

  /**
   * Apply radio button answer
   */
  function applyRadio(answer) {
    const option = answer.correct_option;

    // Try to find by ID first (most reliable)
    let element = document.getElementById(option.option_id);

    // Fallback to name attribute
    if (!element) {
      element = document.querySelector(`input[name="${option.option_name}"][value="${option.option_text}"]`);
    }

    if (!element) throw new Error("Radio not found");

    element.click();
    console.log(`  → Clicked: "${option.option_text}"`);
  }

  /**
   * Apply checkbox answers
   */
  function applyCheckbox(answer) {
    answer.correct_options.forEach((option) => {
      let element = document.getElementById(option.option_id);

      if (!element) {
        element = document.querySelector(`input[name="${option.option_name}"][value="${option.option_text}"]`);
      }

      if (element) {
        element.click();
        console.log(`  → Checked: "${option.option_text}"`);
      }
    });
  }

  /**
   * Apply text input answer
   */
  function applyText(answer) {
    let element = document.getElementById(answer.input_id);

    if (!element) {
      element = document.querySelector(`input[name="${answer.input_name}"]`);
    }

    if (!element) throw new Error("Text input not found");

    fillInput(element, answer.text_answer);
    console.log(`  → Typed: "${answer.text_answer}"`);
  }

  /**
   * Apply textarea answer
   */
  function applyTextarea(answer) {
    let element = document.getElementById(answer.input_id);

    if (!element) {
      element = document.querySelector(`textarea[name="${answer.input_name}"]`);
    }

    if (!element) throw new Error("Textarea not found");

    fillInput(element, answer.text_answer);
    const preview = answer.text_answer.substring(0, 50);
    console.log(`  → Typed: "${preview}..."`);
  }

  /**
   * Fill input with proper event dispatching
   */
  function fillInput(element, value) {
    element.focus();
    element.value = value;

    // Dispatch events (works for most frameworks)
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));

    // InputEvent for React-like frameworks
    const inputEvent = new InputEvent("input", {
      bubbles: true,
      cancelable: true,
      data: value,
      inputType: "insertText",
    });
    element.dispatchEvent(inputEvent);

    element.blur();
  }

  return { applyAnswers };
})();

window.BlackboardApplicator = BlackboardApplicator;
```

---

## STEP 6: Register the Adapter in Routers

### 6.1 Update AdapterRouter.js

Add your platform to the routing logic:

```javascript
// In AdapterRouter.js

async function extract(domData, aiService, siteType) {
  console.log("[AdapterRouter] Detected site type:", siteType);

  switch (siteType) {
    case "googleForms":
      return await extractGoogleForms(domData, aiService);

    case "canvas":
      return await extractCanvas(domData, aiService);

    case "blackboard": // ← ADD THIS
      return await extractBlackboard(domData, aiService);

    default:
      return await extractGeneric(domData, aiService);
  }
}

// Add extraction function
async function extractBlackboard(domData, aiService) {
  try {
    console.log("[AdapterRouter] Trying manual Blackboard extraction...");
    const structure = await window.BlackboardExtractor.extractStructure(domData.cleanedHTML, domData.url);

    if (structure && structure.questions && structure.questions.length > 0) {
      console.log("[AdapterRouter] ✅ Manual extraction succeeded!");
      return structure;
    }
  } catch (error) {
    console.warn("[AdapterRouter] Manual extraction failed:", error.message);
  }

  // Fallback to AI
  return await extractWithAI(domData, aiService, window.BlackboardPrompt);
}
```

### 6.2 Update ApplicatorRouter.js

```javascript
// In ApplicatorRouter.js

async function apply(siteType, answerInstructions) {
  console.log("[ApplicatorRouter] Routing to applicator for:", siteType);

  switch (siteType) {
    case "canvas":
      return await window.CanvasApplicator.applyAnswers(answerInstructions);

    case "googleForms":
      return await window.GoogleFormsApplicator.applyAnswers(answerInstructions);

    case "blackboard": // ← ADD THIS
      return await window.BlackboardApplicator.applyAnswers(answerInstructions);

    default:
      return await window.GenericApplicator.applyAnswers(answerInstructions);
  }
}
```

### 6.3 Update AIAnswerGenerator.js

```javascript
// In AIAnswerGenerator.js - selectPrompt function

function selectPrompt(siteType, quizStructure) {
  switch (siteType) {
    case "canvas":
      return window.CanvasAnsGenPrompt(quizStructure);

    case "googleForms":
      return window.GoogleFormsAnsGenPrompt(quizStructure);

    case "blackboard": // ← ADD THIS
      return window.BlackboardAnsGenPrompt(quizStructure);

    default:
      return window.GenericAnsGenPrompt(quizStructure);
  }
}
```

---

## STEP 7: Add Site Detection Pattern

Update `content.js` to detect your platform:

```javascript
// In content.js

const SITE_PATTERNS = {
  googleForms: /forms\.google\.com|docs\.google\.com\/forms/i,
  canvas: /canvas\./i,
  moodle: /moodle\./i,
  blackboard: /blackboard\.|\.bb\.com/i, // ← ADD THIS
};
```

---

## STEP 8: Update manifest.json

Add your files to the content scripts:

```json
{
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": [
        "config/constants.js",

        "services/ai/IAIService.js",
        "services/ai/GeminiService.js",

        "adapters/google-forms/GoogleFormsPrompt.js",
        "adapters/google-forms/GoogleFormsExtractor.js",
        "adapters/google-forms/GoogleFormsApplicator.js",
        "adapters/google-forms/GoogleFormsAnsGenPrompt.js",

        "adapters/canvas/CanvasPrompt.js",
        "adapters/canvas/CanvasExtractor.js",
        "adapters/canvas/CanvasApplicator.js",
        "adapters/canvas/CanvasAnsGenPrompt.js",

        "adapters/blackboard/BlackboardPrompt.js",
        "adapters/blackboard/BlackboardExtractor.js",
        "adapters/blackboard/BlackboardApplicator.js",
        "adapters/blackboard/BlackboardAnsGenPrompt.js",

        "adapters/generic/GenericPrompt.js",
        "adapters/generic/GenericExtractor.js",
        "adapters/generic/GenericApplicator.js",

        "services/extractors/AdapterRouter.js",
        "services/applicators/ApplicatorRouter.js",
        "services/generators/AIAnswerGenerator.js",

        "content/ErrorHandlerPopup.js",
        "content/DOMManager.js",
        "content/content.js"
      ]
    }
  ]
}
```

---

## STEP 9: Test Your Adapter

### 9.1 Load Extension

```
1. Go to chrome://extensions
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select your extension folder
```

### 9.2 Test on Real Quiz

```
1. Navigate to a Blackboard quiz
2. Press Ctrl+Shift+Q
3. Check console for logs
4. Verify answers are filled
```

### 9.3 Debug Issues

**Common Problems:**

| Problem                 | Solution                           |
| ----------------------- | ---------------------------------- |
| Extension doesn't load  | Check console for syntax errors    |
| Site not detected       | Verify SITE_PATTERNS regex         |
| Extraction fails        | Check HTML selectors in extractor  |
| Answers not filled      | Verify DOM selectors in applicator |
| AI returns invalid JSON | Improve prompt template            |

**Debugging Tips:**

- Open DevTools Console (`F12`)
- Look for `[BlackboardExtractor]` logs
- Use `console.log()` to trace execution
- Test each component independently

---

## 📋 Checklist for New Adapter

Use this checklist when creating a new adapter:

```
□ Step 1: Analyze platform HTML structure
  □ Documented quiz container selector
  □ Documented question container selector
  □ Documented all question types (radio, checkbox, text, textarea)
  □ Documented ID/class/name patterns

□ Step 2: Create Prompt Template
  □ File created: adapters/[platform]/[Platform]Prompt.js
  □ Includes platform-specific patterns
  □ Provides example JSON structure
  □ Exports: window.[Platform]Prompt

□ Step 3: Create Extractor
  □ File created: adapters/[platform]/[Platform]Extractor.js
  □ extractStructure() function implemented
  □ Handles all question types
  □ Returns proper JSON structure
  □ Exports: window.[Platform]Extractor

□ Step 4: Create Answer Generation Prompt
  □ File created: adapters/[platform]/[Platform]AnsGenPrompt.js
  □ generate(quizStructure) function implemented
  □ Documents all answer formats
  □ Includes platform-specific rules
  □ Exports: window.[Platform]AnsGenPrompt

□ Step 5: Create Applicator
  □ File created: adapters/[platform]/[Platform]Applicator.js
  □ applyAnswers() function implemented
  □ Handles radio buttons
  □ Handles checkboxes
  □ Handles text inputs
  □ Handles textareas
  □ Dispatches proper events
  □ Exports: window.[Platform]Applicator

□ Step 6: Register in Routers
  □ Added to AdapterRouter.js
  □ Added to ApplicatorRouter.js
  □ Added to AIAnswerGenerator.js

□ Step 7: Add Site Detection
  □ Pattern added to SITE_PATTERNS in content.js

□ Step 8: Update manifest.json
  □ All 4 files added to content_scripts.js array
  □ Files in correct load order

□ Step 9: Test
  □ Extension loads without errors
  □ Site detected correctly
  □ Extraction works
  □ Answer generation works
  □ Applicator fills form correctly
  □ No console errors
```

---

## 🎓 Advanced Topics

### Custom Event Dispatching

Some platforms require custom events. Example for React:

```javascript
function fillInputReact(element, value) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;

  nativeInputValueSetter.call(element, value);

  const event = new Event("input", { bubbles: true });
  element.dispatchEvent(event);
}
```

### Rich Text Editors

For platforms using TinyMCE, CKEditor, Quill:

```javascript
function fillRichText(element, value) {
  // TinyMCE
  if (window.tinymce) {
    const editor = window.tinymce.get(element.id);
    if (editor) {
      editor.setContent(`<p>${value}</p>`);
      editor.save();
    }
  }

  // CKEditor
  if (window.CKEDITOR) {
    const editor = window.CKEDITOR.instances[element.id];
    if (editor) {
      editor.setData(value);
    }
  }

  // Quill
  if (element.classList.contains("ql-editor")) {
    element.innerHTML = `<p>${value}</p>`;
  }
}
```

### Handling Dynamic Content

For SPAs that load content dynamically:

```javascript
async function waitForElement(selector, timeout = 5000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector);
    if (element) return element;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Element ${selector} not found after ${timeout}ms`);
}

// Usage
async function applyRadio(answer) {
  const element = await waitForElement(`#${answer.correct_option.option_id}`);
  element.click();
}
```

---

## 🔧 Testing Your Adapter

### Unit Testing (Optional)

Create a test file:

```javascript
// test/blackboard-adapter.test.js

async function testBlackboardExtractor() {
  const sampleHTML = `
    <div id="content_listContainer">
      <div class="vtbegenerated" data-qid="12345">
        <legend class="question_text">What is 2+2?</legend>
        <input type="radio" name="answer_12345" id="ans_1"><label for="ans_1">3</label>
        <input type="radio" name="answer_12345" id="ans_2"><label for="ans_2">4</label>
      </div>
    </div>
  `;

  const result = await BlackboardExtractor.extractStructure(sampleHTML, "http://test.com");

  console.assert(result.questions.length === 1, "Should extract 1 question");
  console.assert(result.questions[0].question_type === "radio", "Should be radio type");
  console.assert(result.questions[0].options.length === 2, "Should have 2 options");

  console.log("✅ All tests passed!");
}
```

---

## 📚 Resources

### Example Adapters to Study

- `adapters/canvas/` - Most complete implementation
- `adapters/google-forms/` - Complex DOM manipulation
- `adapters/generic/` - Minimal AI-based approach

### Useful DevTools Features

- **Elements Tab** - Inspect HTML structure
- **Console** - Test selectors: `document.querySelector('.class')`
- **Network Tab** - See AJAX requests
- **Sources Tab** - View page JavaScript

### Testing URLs

Always test on:

- Empty quiz (0 questions)
- Single question quiz
- Multi-question quiz with all types
- Quiz with required fields
- Quiz with point values

---

## 🎯 Summary

To add a new platform:

1. **Analyze** the HTML structure
2. **Create** 4 adapter files (Prompt, Extractor, AnsGenPrompt, Applicator)
3. **Register** in 3 routers
4. **Add** site detection pattern
5. **Update** manifest.json
6. **Test** thoroughly

**Time Estimate:** 2-4 hours per platform

**Difficulty:**

- Simple platforms (similar to Canvas): 2 hours
- Complex platforms (custom frameworks): 4+ hours

---

## 💡 Tips for Success

1. **Start with Canvas adapter** - Use it as a template
2. **Test incrementally** - Test after each component
3. **Use console.log()** - Debug extraction issues
4. **Check existing adapters** - Don't reinvent the wheel
5. **Document patterns** - Write down what you find
6. **Test thoroughly** - Different question types, edge cases
7. **Ask for help** - Open an issue if stuck

---

**Need Help?** Check existing adapters or open an issue with:

- Platform name and URL
- HTML structure screenshot
- Error messages
- What you've tried

Happy coding! 🚀
