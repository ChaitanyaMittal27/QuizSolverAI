# Quiz Solver - AI-Powered Quiz Automation Extension

> **Automatically solve online quizzes using AI** - Supports Canvas LMS, Google Forms, CourSys, and more

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-Extension-green?logo=googlechrome" alt="Chrome Extension">
  <img src="https://img.shields.io/badge/AI-Gemini_Flash-blue?logo=google" alt="Gemini AI">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
  <img src="https://img.shields.io/badge/Version-1.0.0-orange" alt="Version">
</p>

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Supported Platforms](#supported-platforms)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Architecture](#architecture)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [How It Works](#how-it-works)
- [Extending Support](#extending-support)
- [Privacy & Ethics](#privacy--ethics)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Quiz Solver** is a Chrome extension that uses AI (Google Gemini) to automatically extract quiz questions from web pages, generate correct answers, and fill in the form fields - all with a single keyboard shortcut.

### What It Does

1. **Extracts** quiz questions from the DOM
2. **Analyzes** questions using AI
3. **Generates** correct answers
4. **Fills** form fields automatically

### Use Cases

- 📚 Educational practice quizzes
- 🧪 Testing and QA automation
- 🔄 Repetitive form filling
- 🎓 Learning platform integration

---

## ✨ Features

### Core Features

- ⚡ **One-Click Solving** - Press `Ctrl+Shift+Q` to solve any quiz
- 🤖 **AI-Powered** - Uses Google Gemini Flash for intelligent answers
- 🎯 **Multi-Platform** - Works on Canvas, Google Forms, CourSys, and generic sites
- 🔄 **Dual Strategy** - Manual DOM parsing with AI fallback
- 🎨 **Styled Errors** - Chrome-style error popups with dark/light themes
- 📊 **Detailed Logging** - Console logs for debugging and tracking

### Supported Question Types

| Type         | Description                        | Support |
| ------------ | ---------------------------------- | ------- |
| **Radio**    | Multiple choice (single answer)    | ✅ Full |
| **Checkbox** | Multiple choice (multiple answers) | ✅ Full |
| **Text**     | Short answer input                 | ✅ Full |
| **Textarea** | Essay/long answer                  | ✅ Full |
| **Select**   | Dropdown menu                      | ✅ Full |

## 🌐 Supported Platforms

### Tier 1: Full Support (Manual + AI)

<table>
  <tr>
    <td align="center">
      <strong>Canvas LMS</strong><br>
      <code>*.canvas.*</code><br>
      ✅ Manual Extractor<br>
      ✅ TinyMCE Support<br>
      ✅ All Question Types
    </td>
    <td align="center">
      <strong>Google Forms</strong><br>
      <code>forms.google.com</code><br>
      ✅ Manual Extractor<br>
      ✅ Custom Selectors<br>
      ✅ All Question Types
    </td>
    <td align="center">
      <strong>CourSys (SFU)</strong><br>
      <code>coursys.sfu.ca</code><br>
      ✅ Manual Extractor<br>
      ✅ Dropdown Support<br>
      ✅ All Question Types
    </td>
  </tr>
</table>

### Tier 2: AI Support (Generic Fallback)

- Moodle (detected, uses generic adapter)
- Blackboard (can be extended - see guide)
- Custom quiz platforms
- Any HTML form with standard inputs

---

## 📦 Installation

### Prerequisites

- Google Chrome (version 88+)
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Method 1: From Source (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/quiz-solver.git
cd quiz-solver

# 2. Install in Chrome
# - Open chrome://extensions
# - Enable "Developer mode"
# - Click "Load unpacked"
# - Select the extension folder
```

### Method 2: From Chrome Web Store

_Coming soon_

### Directory Structure

```
quiz-solver/
├── config/
│   └── constants.js              # Configuration (add API key here)
├── adapters/
│   ├── canvas/                   # Canvas LMS adapter
│   ├── google-forms/             # Google Forms adapter
│   ├── coursys/                  # CourSys (SFU) adapter
│   └── generic/                  # Generic fallback
├── services/
│   ├── ai/                       # AI services (Gemini)
│   ├── extractors/               # Extraction routing
│   ├── applicators/              # Application routing
│   └── generators/               # Answer generation
├── content/
│   ├── content.js                # Main content script
│   ├── DOMManager.js             # DOM extraction
│   └── ErrorHandlerPopup.js      # Error handling
├── styles/
│   └── error-popup.css           # Error popup styles
├── icons/                        # Extension icons
└── manifest.json                 # Extension manifest
```

---

## ⚙️ Configuration

### Step 1: Add Your API Key

Edit `config/constants.js`:

```javascript
const CONFIG = {
  GEMINI_API_KEY: "YOUR_API_KEY_HERE", // ← Add your key
  GEMINI_API_ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",

  SHORTCUTS: {
    SOLVE: { ctrl: true, shift: true, key: "Q" },
    UNDO: { ctrl: true, shift: true, key: "E" },
  },

  DELAYS: {
    MIN: 100,
    MAX: 500,
  },
};
```

### Step 2: Get a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key to `config/constants.js`

### Step 3: Reload Extension

```
1. Go to chrome://extensions
2. Find "Quiz Solver"
3. Click the refresh icon 🔄
```

---

## 🚀 Usage

### Basic Usage

1. **Navigate** to a quiz page (Canvas, Google Forms, CourSys, etc.)
2. **Press** `Ctrl+Shift+Q`
3. **Wait** for AI to analyze (5-15 seconds)
4. **Review** filled answers
5. **Submit** when ready

### Detailed Steps

#### On Canvas LMS

```
1. Navigate to quiz: https://canvas.university.edu/courses/123/quizzes/456/take
2. Start the quiz attempt
3. Press Ctrl+Shift+Q
4. Extension extracts questions using manual DOM parser
5. AI generates answers
6. Form fields are filled automatically
7. Review and submit
```

#### On Google Forms

```
1. Navigate to form: https://docs.google.com/forms/d/abc123/viewform
2. Press Ctrl+Shift+Q
3. Extension extracts questions using manual parser
4. AI analyzes questions
5. Answers are applied via DOM manipulation
6. Review and submit
```

#### On CourSys (SFU)

```
1. Navigate to form: https://coursys.sfu.ca/forms/...
2. Press Ctrl+Shift+Q
3. Extension extracts questions (radio, checkbox, text, textarea, select)
4. AI generates answers
5. Answers are applied (file uploads skipped automatically)
6. Review and submit
```

#### On Generic Sites

```
1. Navigate to any quiz page
2. Press Ctrl+Shift+Q
3. Extension uses AI to extract quiz structure
4. AI generates answers
5. Generic applicator fills fields
6. Review and submit
```

### Console Output

Check the browser console (`F12`) for detailed logs:

```
[Quiz Solver] 🎯 Solve triggered!
[Quiz Solver] ✓ DOM extracted
[Quiz Solver] Detected site: coursys
[Quiz Solver] 🔍 Extracting quiz structure...
[CoursysExtractor] Found 28 questions
[Quiz Solver] ✅ Structure extracted!
[Quiz Solver] 🧠 Generating answers...
[AIAnswerGenerator] Answers generated successfully
[Quiz Solver] ✏️ Filling answers...
[CoursysApplicator] Success: 24/24
[Quiz Solver] ✔️ Quiz solved!
[Quiz Solver] 📊 Results: 24/24 answered
```

---

## 🏗️ Architecture

### High-Level Overview

```
┌─────────────┐
│    USER     │
│  (Ctrl+Q)   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│        CONTENT SCRIPT               │
│  ┌─────────────────────────────┐   │
│  │    1. DOM EXTRACTION        │   │
│  │    DOMManager.js            │   │
│  └──────────┬──────────────────┘   │
│             │                       │
│             ▼                       │
│  ┌─────────────────────────────┐   │
│  │    2. SITE DETECTION        │   │
│  │    detectSite()             │   │
│  └──────────┬──────────────────┘   │
│             │                       │
│             ▼                       │
│  ┌─────────────────────────────┐   │
│  │    3. ADAPTER ROUTER        │   │
│  │    Routes to:               │   │
│  │    - CanvasExtractor        │   │
│  │    - GoogleFormsExtractor   │   │
│  │    - CoursysExtractor       │   │
│  │    - GenericExtractor       │   │
│  └──────────┬──────────────────┘   │
│             │                       │
│             ▼                       │
│  ┌─────────────────────────────┐   │
│  │    4. AI ANSWER GEN         │   │
│  │    AIAnswerGenerator.js     │   │
│  │    → Gemini API             │   │
│  └──────────┬──────────────────┘   │
│             │                       │
│             ▼                       │
│  ┌─────────────────────────────┐   │
│  │    5. APPLICATOR ROUTER     │   │
│  │    Routes to:               │   │
│  │    - CanvasApplicator       │   │
│  │    - GoogleFormsApplicator  │   │
│  │    - CoursysApplicator      │   │
│  │    - GenericApplicator      │   │
│  └──────────┬──────────────────┘   │
│             │                       │
│             ▼                       │
│  ┌─────────────────────────────┐   │
│  │    6. QUIZ COMPLETED        │   │
│  │    Results logged           │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Component Details

#### DOMManager

- Extracts raw HTML from page
- Cleans scripts, styles, iframes
- Returns structured DOM data

#### AdapterRouter

- Detects site type (Canvas, Google Forms, CourSys, etc.)
- Routes to appropriate extractor
- Falls back to AI if manual extraction fails

#### Extractors

- **Manual extractors** - Parse DOM directly using selectors
- **AI extractor** - Uses Gemini to understand structure
- Return standardized question format

#### AIAnswerGenerator

- Takes question structure
- Sends to Gemini API with platform-specific prompt
- Returns answer instructions

#### Applicators

- Take answer instructions
- Fill form fields using DOM manipulation
- Dispatch proper events for frameworks

### Data Flow

```javascript
// 1. DOM Data
{
  url: "https://coursys.sfu.ca/forms/...",
  cleanedHTML: "<html>...</html>",
  timestamp: "2025-01-15T10:30:00.000Z"
}

// 2. Quiz Structure
{
  quizMetadata: {
    url: "...",
    platform: "coursys",
    title: "Breadth Evaluation"
  },
  questions: [
    {
      qid: "q1",
      question_type: "radio",
      question_text: "What is 2+2?",
      options: [...]
    }
  ]
}

// 3. Answer Instructions
{
  answers: [
    {
      qid: "q1",
      question_type: "radio",
      correct_option: {
        oid: "opt2",
        option_id: "id_4_1",
        option_text: "4"
      }
    }
  ]
}

// 4. Application Results
{
  total: 24,
  success: 24,
  failed: 0,
  details: [
    { qid: "q1", status: "success" }
  ]
}
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut       | Action               | Status         |
| -------------- | -------------------- | -------------- |
| `Ctrl+Shift+Q` | Solve Quiz           | ✅ Implemented |
| `Ctrl+Shift+E` | Undo (Clear Answers) | 🚧 Planned     |

### Customizing Shortcuts

Edit `config/constants.js`:

```javascript
SHORTCUTS: {
  SOLVE: { ctrl: true, shift: true, key: "S" },  // Change to Ctrl+Shift+S
  UNDO: { ctrl: true, shift: true, key: "U" },
}
```

---

## 🔍 How It Works

### Phase 1: Extraction

```javascript
// Manual extraction (CourSys example)
const dlform = document.querySelector("dl.dlform");
const dtElements = dlform.querySelectorAll("dt");

dtElements.forEach((dt, idx) => {
  const label = dt.querySelector("label");
  const questionText = label.textContent.trim();
  const forAttr = label.getAttribute("for");

  const question = {
    qid: `q${idx + 1}`,
    question_id: forAttr,
    question_text: questionText,
    question_type: detectType(dt.nextElementSibling),
    options: extractOptions(dt.nextElementSibling),
  };
});
```

### Phase 2: AI Analysis

```javascript
// Send to Gemini API
const prompt = `You are a quiz solver. Answer these questions:
${JSON.stringify(questions)}`;

const response = await geminiService.query(prompt);
const answers = JSON.parse(response);
```

### Phase 3: Application

```javascript
// Fill form fields
const radioButton = document.getElementById(answer.correct_option.option_id);
radioButton.click();

const textInput = document.getElementById(answer.input_id);
textInput.value = answer.text_answer;
textInput.dispatchEvent(new Event("input", { bubbles: true }));

const select = document.getElementById(answer.input_id);
select.value = answer.selected_option.option_value;
select.dispatchEvent(new Event("change", { bubbles: true }));
```

---

## 🔧 Extending Support

Want to add support for a new platform? See our **[Custom Adapter Guide](CUSTOM_ADAPTER_GUIDE.md)**.

### Quick Overview

1. Create 4 adapter files (Prompt, Extractor, AnsGenPrompt, Applicator)
2. Register in routers (AdapterRouter, ApplicatorRouter, AIAnswerGenerator)
3. Add site detection pattern
4. Update manifest.json
5. Test thoroughly

**Example:** Adding CourSys support took ~2-3 hours.

### File Structure for New Platform

```
adapters/
└── yourplatform/
    ├── YourPlatformPrompt.js        # AI extraction instructions
    ├── YourPlatformExtractor.js     # Manual DOM parser
    ├── YourPlatformAnsGenPrompt.js  # Answer generation instructions
    └── YourPlatformApplicator.js    # Answer application logic
```

---

## 🔒 Privacy & Ethics

### Data Privacy

- ✅ **No data collection** - Extension runs entirely locally
- ✅ **No tracking** - No analytics or telemetry
- ✅ **API only** - Only sends quiz questions to Gemini API
- ✅ **Open source** - Audit the code yourself

### Ethical Use

**This extension is for:**

- ✅ Educational practice and self-assessment
- ✅ Testing and QA automation
- ✅ Accessibility assistance
- ✅ Personal learning tools

**This extension is NOT for:**

- ❌ Cheating on graded assessments
- ❌ Academic dishonesty
- ❌ Certification exams
- ❌ Violating terms of service

### Legal Disclaimer

> This tool is provided for educational and testing purposes only. Users are responsible for complying with all applicable laws, regulations, and terms of service of the platforms they use this extension on. The developers assume no liability for misuse.

---

## 🤝 Contributing

We welcome contributions! Here's how:

### Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest features
- 📝 Improve documentation
- 🔧 Add platform support
- 🧪 Write tests
- 🌍 Translate

### Development Setup

```bash
# 1. Fork the repository
git clone https://github.com/yourusername/quiz-solver.git
cd quiz-solver

# 2. Create a branch
git checkout -b feature/new-platform

# 3. Make changes
# ... edit files ...

# 4. Test thoroughly
# Load extension in Chrome and test

# 5. Commit and push
git add .
git commit -m "Add support for Blackboard"
git push origin feature/new-platform

# 6. Open Pull Request
```

### Code Style

- Use consistent naming (PascalCase for classes, camelCase for functions)
- Add console.log statements for debugging
- Document complex logic with comments
- Follow existing adapter patterns
- Test on real quiz pages

### Pull Request Checklist

- [ ] Code follows existing style
- [ ] All files added to manifest.json
- [ ] Tested on real platform
- [ ] Console logs added
- [ ] README updated (if needed)
- [ ] No API keys committed

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Made with ❤️ by Anonymouse</strong><br>
  <sub>Empowering learners with AI automation</sub>
</p>

---

**⭐ If you find this useful, please star the repository!**
