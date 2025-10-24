# Quiz Solver Chrome Extension

> **⚠️ Educational Purpose Only**: This extension is designed for educational and research purposes. Always respect academic integrity policies and terms of service of online platforms.

An intelligent Chrome extension that automatically analyzes and solves online quizzes using AI. It supports multiple quiz platforms including Google Forms, Canvas LMS, and generic quiz sites.

## 🌟 Features

- **Multi-Platform Support**: Works with Google Forms, Canvas LMS, Moodle, and generic quiz sites
- **Intelligent Extraction**: Combines manual DOM extraction with AI-powered fallback
- **Multiple Question Types**: Handles radio buttons, checkboxes, text inputs, and text areas
- **Smart Answer Generation**: Uses Google's Gemini AI to determine correct answers
- **Automatic Form Filling**: Intelligently fills in answers with proper event triggering
- **Keyboard Shortcuts**: Quick access via Ctrl+Shift+Q
- **Error Handling**: User-friendly error notifications with Chrome-style UI

## 🏗️ Architecture

The extension follows a modular, pipeline-based architecture:

```
User Trigger → DOM Extraction → Structure Parsing → Answer Generation → Form Filling
```

### Core Components

1. **DOMManager**: Extracts and cleans HTML from web pages
2. **AdapterRouter**: Routes extraction to site-specific adapters
3. **Extractors**: Site-specific extraction logic (Google Forms, Canvas, Generic)
4. **AIAnswerGenerator**: Generates correct answers using Gemini AI
5. **AnswerApplicator**: Applies answers to the DOM with proper event handling
6. **GeminiService**: Handles communication with Google's Gemini API

### Extraction Strategy

The extension uses a two-tier approach:

1. **Manual Extraction** (Fast, Reliable)
   - Attempts manual DOM parsing for known platforms
   - Currently implemented for Google Forms
2. **AI Fallback** (Flexible, Universal)
   - Falls back to AI-based extraction if manual extraction fails
   - Works with any quiz platform

## 📋 Prerequisites

- Google Chrome or Chromium-based browser
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/quiz-solver-extension.git
cd quiz-solver-extension
```

### 2. Configure API Key

Edit `config/constants-placeholder.js`:
Put your API key in appropraite place.
Rename file to constants.js

### 3. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select your extension directory
5. The extension should now be loaded and active

## 📖 Usage

### Basic Usage

1. Navigate to any quiz page (Google Forms, Canvas, etc.)
2. Press **Ctrl+Shift+Q** to activate the solver
3. Wait for the AI to process (check console for progress)
4. Answers will be automatically filled in

### Keyboard Shortcuts

| Shortcut       | Action                     |
| -------------- | -------------------------- |
| `Ctrl+Shift+Q` | Solve quiz                 |
| `Ctrl+Shift+E` | Undo (not yet implemented) |

### Supported Platforms

#### ✅ Fully Supported

- **Google Forms**: Manual + AI extraction
- **Generic sites**: AI-based extraction

#### 🚧 Partial Support

- **Canvas LMS**: AI extraction only (manual coming soon)
- **Moodle**: AI extraction only (manual coming soon)

## 🔧 Configuration

Edit `config/constants.js` to customize:

```javascript
const CONFIG = {
  // API Configuration
  GEMINI_API_KEY: "your-key-here",
  GEMINI_API_ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",

  // Keyboard shortcuts
  SHORTCUTS: {
    SOLVE: { ctrl: true, shift: true, key: "Q" },
    UNDO: { ctrl: true, shift: true, key: "E" },
  },

  // Timing (for future use)
  DELAYS: {
    MIN: 100,
    MAX: 500,
  },
};
```

## 🐛 Known Issues

1. **API Key Security**: Currently hardcoded (should use Chrome storage API)
2. **Type Inconsistency**: `paragraph` vs `textarea` type mismatch between components
3. **No Undo Feature**: Undo functionality not yet implemented
4. **No Loading UI**: Users don't see progress during AI processing
5. **Canvas/Moodle**: Manual extraction not yet implemented
6. **No Rate Limiting**: Could hit API rate limits on heavy use

## 📊 Console Output

The extension provides detailed logging:

```
[Quiz Solver] Extension loaded successfully! 🚀
[Quiz Solver] 🎯 Solve triggered!
[Quiz Solver] ✓ DOM extracted
[AdapterRouter] Detected site type: googleForms
[AdapterRouter] Trying manual Google Forms extraction...
[GoogleFormsExtractor] Extracted 5 questions
[Quiz Solver] ✅ Structure extracted!
[AnswerGenerator] 🧠 Generating answers...
[AnswerGenerator] ✅ Answers generated successfully
[AnswerApplicator] ✏️ Applying answers...
[AnswerApplicator] ✅ Complete!
[Quiz Solver] 📊 Results: 5/5 answered
```

## 🔍 How It Works

### 1. DOM Extraction

```javascript
const domManager = new DOMManager();
const domData = domManager.extractCleanHTML();
// Returns: { cleanedHTML, url, timestamp }
```

### 2. Structure Extraction

```javascript
const quizStructure = await AdapterRouter.extract(domData, geminiService);
// Returns: { quizMetadata, questions[] }
```

### 3. Answer Generation

```javascript
const answerInstructions = await AIAnswerGenerator.generateAnswers(quizStructure, geminiService);
// Returns: { answers[] }
```

### 4. Form Filling

```javascript
const results = await AnswerApplicator.applyAnswers(answerInstructions);
// Returns: { total, success, failed, details[] }
```

## 🧪 Question Types Supported

| Type       | Description     | Example                         |
| ---------- | --------------- | ------------------------------- |
| `radio`    | Single choice   | Multiple choice with one answer |
| `checkbox` | Multiple choice | Select all that apply           |
| `text`     | Short answer    | Single-line text input          |
| `textarea` | Long answer     | Multi-line paragraph input      |

## 🛠️ Development

### Adding a New Platform

1. Create extractor in `adapters/your-platform/`
2. Create prompt template `YourPlatformPrompt.js`
3. Create extractor `YourPlatformExtractor.js`
4. Add detection pattern to `AdapterRouter.js`
5. Add extraction case in `AdapterRouter.extract()`

Example:

```javascript
// In AdapterRouter.js
const SITE_PATTERNS = {
  yourPlatform: /yourplatform\.com/i,
};

case "yourPlatform":
  return await extractYourPlatform(domData, aiService);
```

### Debugging

Open Chrome DevTools Console to see detailed logs from each component:

- `[Quiz Solver]` - Main orchestration
- `[AdapterRouter]` - Routing decisions
- `[GoogleFormsExtractor]` - Manual extraction
- `[AnswerGenerator]` - AI answer generation
- `[AnswerApplicator]` - Form filling

## 📄 Project Structure

```
.
├── manifest.json              # Extension manifest
├── config/
│   └── constants.js          # Configuration and API keys
├── services/
│   ├── ai/                   # AI service layer
│   ├── extractors/           # Extraction routing
│   └── generators/           # Answer generation
├── adapters/                 # Platform-specific adapters
│   ├── google-forms/         # Google Forms support
│   ├── canvas/               # Canvas LMS support
│   └── generic/              # Generic quiz support
├── content/                  # Content scripts
│   ├── content.js           # Main entry point
│   ├── DOMManager.js        # DOM extraction
│   ├── AnswerApplicator.js  # Answer filling
│   └── ErrorHandlerPopup.js # Error handling
└── styles/
    └── error-popup.css      # Error UI styling
```

## 🔐 Security Considerations

- **API Key**: Never commit API keys to version control
- **Rate Limiting**: Implement rate limiting to avoid API quota exhaustion
- **Input Validation**: Validate all DOM selections before manipulation
- **Error Handling**: Gracefully handle failures without exposing sensitive data

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Priority TODOs

- [ ] Implement secure API key storage (Chrome storage API)
- [ ] Fix paragraph/textarea type inconsistency
- [ ] Add undo functionality
- [ ] Implement loading/progress indicators
- [ ] Complete Canvas manual extractor
- [ ] Complete Moodle manual extractor
- [ ] Add rate limiting
- [ ] Add answer validation
- [ ] Implement delay between actions
- [ ] Create extension icons

## ⚠️ Disclaimer

This extension is intended for:

- Educational purposes
- Testing and research
- Personal study aids

**Please note:**

- Always respect academic integrity policies
- Check platform terms of service before use
- Use responsibly and ethically
- The developers are not responsible for misuse

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Google Gemini AI for answer generation
- Chrome Extensions API
- Open source community

## 📧 Support

For issues, questions, or contributions:

- Open an issue on GitHub
- Check existing issues for solutions
- Review the console logs for debugging

---

**Made with ❤️ for educational purposes**
