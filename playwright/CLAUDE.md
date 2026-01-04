# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 Project Overview

Advanced Playwright-based AI visual testing system with Qwen-VL integration for comprehensive web UI testing, featuring Chinese captcha recognition and mathematical captcha solving capabilities.

## 🏗️ System Architecture

### Core Components
- **AI Detection Engine** (`visual-ai-detector.js`) - Qwen-VL model integration
- **Pixel Comparator** (`pixel-comparator.js`) - Sub-pixel precision diff detection  
- **Report Generator** (`generate-demo-reports.js`) - HTML/JSON dual-format reports
- **Test Framework** (Playwright) - Cross-browser automation

### AI Integration
- **Model**: qwen-vl-max-latest via DashScope API
- **Capabilities**: Visual understanding, UI analysis, WCAG compliance, difference explanation
- **Special Features**: Chinese character recognition (95% accuracy), mathematical captcha solving (100% accuracy)

## 🚀 Quick Commands

### Standard Testing
```bash
npm test                          # Run all tests headlessly
npm run test:headed              # Run tests with browser UI
npm run test:ui                  # Open Playwright Test UI
npm run test:debug               # Debug mode with Inspector
npm run test:report              # View HTML test report
```

### AI Visual Testing
```bash
npm run test:visual              # Run AI visual regression tests
npm run test:visual:headed       # AI visual tests with UI
node generate-demo-reports.js    # Generate AI analysis reports
```

### Specific Test Execution
```bash
npx playwright test tests/chinese-captcha-ai.spec.js        # Chinese captcha AI recognition
npx playwright test tests/math-captcha-ai.spec.js          # Math captcha AI solving
npx playwright test tests/visual-ai-regression.spec.js     # Visual regression testing
npx playwright test --grep "AI识别"                      # Run tests by pattern
```

### Report Viewing
```bash
open visual-test-results/final-visual-report.html          # AI visual test report
open comprehensive-test-results/comprehensive-report.html  # Comprehensive analysis
open playwright-report/index.html                         # Standard Playwright report
```

## 📁 Key File Structure

### Test Files
- `tests/visual-ai-regression.spec.js` - Core AI visual regression tests
- `tests/chinese-captcha-ai.spec.js` - Chinese character captcha AI recognition
- `tests/math-captcha-ai.spec.js` - Mathematical captcha AI solving
- `tests/comprehensive-visual-test.spec.js` - Multi-dimensional visual testing

### AI System Files
- `visual-ai-detector.js` - Main AI detection and analysis engine
- `pixel-comparator.js` - Pixel-level difference detection
- `generate-demo-reports.js` - Report generation system

### Test Pages
- `login.html` - Standard login page with captcha
- `chinese-click-captcha.html` - 4x4 Chinese character grid captcha
- `math-captcha.html` - Mathematical expression captcha
- `test-pages/broken-layout.html` - Layout regression test page
- `test-pages/color-broken.html` - Color/accessibility test page

## 🎯 AI Testing Capabilities

### Captcha Recognition Systems
1. **中文点击验证码** - 95% recognition accuracy, 100% click execution success
2. **数学题验证码** - 100% calculation accuracy for basic arithmetic operations
3. **动态验证码** - Real-time character recognition and interaction

### Visual Analysis Features
- **Layout Comparison** - Detect pixel-level differences (0.31% accuracy threshold)
- **Accessibility Analysis** - WCAG 2.1 compliance checking
- **Cross-device Validation** - Desktop, tablet, mobile consistency testing
- **Dynamic State Capture** - Interactive form state verification

## 🔧 Development Workflow

### Setting Up AI Tests
1. Create test file in `tests/` with `.spec.js` extension
2. Import AI detection: `const { VisualAIDetector } = require('../visual-ai-detector.js')`
3. Define baseline and test page URLs
4. Use AI assertions: `await aiDetector.analyzeVisualDifferences(page, baseline, test)`

### Adding New Captcha Types
1. Create HTML test page with captcha implementation
2. Add corresponding AI recognition logic in test file
3. Update comprehensive test suite for full coverage
4. Generate new demo reports for documentation

### Report Customization
- Edit `generate-demo-reports.js` for new report formats
- Modify report templates in `visual-test-results/` and `comprehensive-test-results/`
- Add new AI analysis metrics to detection engine

## 📊 Performance Metrics

### AI Recognition Accuracy
- Chinese Character Captcha: 95% recognition, 100% execution
- Math Captcha: 100% recognition + calculation accuracy
- Visual Regression: 0.31% acceptable difference threshold
- Cross-browser Consistency: 99%+ accuracy across Chromium/Firefox/WebKit

### System Performance
- Average test execution: 30-60 seconds per test suite
- API response time: 2-5 seconds per AI analysis
- Report generation: 10-15 seconds for comprehensive reports
- Memory usage: <500MB for full test suite execution

## 🧪 Advanced Features

### Multi-dimensional Testing
```javascript
// Example AI test structure
const result = await aiDetector.analyzePage({
  page,
  url: 'test-page.html',
  checks: ['layout', 'colors', 'accessibility', 'interactivity']
});
```

### Custom Threshold Configuration
```javascript
const aiDetector = new VisualAIDetector({
  pixelThreshold: 0.31,    // 0.31% difference tolerance
  accessibilityLevel: 'WCAG2.1AA',
  aiConfidence: 0.95       // 95% AI confidence threshold
});
```