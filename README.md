# NutriVibe — Smart Food & Health Assistant

**NutriVibe** is an AI-powered health companion built for the Google Antigravity challenge. It helps users make better food choices by combining real-time AI analysis with beautiful data visualizations.

## 🎯 Chosen Vertical
**Food & Health**: Designing a smart solution to help individuals build healthier eating habits.

## 🧠 Approach and Logic
NutriVibe leverages the **multimodal intelligence of Gemini 2.0 Flash** to bridge the gap between "logging data" and "understanding health."

1.  **Context-Aware Analysis**: Instead of manual database searches, users type meals in natural language. Gemini extracts precise nutritional data (calories, macros) and provides an immediate "Better Alternative" swap.
2.  **Smart Personalization**: The assistant uses the user's height, weight, age, and health conditions to generate meal suggestions tailored to the specific time of day (Breakfast/Lunch/Dinner) and their dietary focus.
3.  **Visual Feedback**: Using **Google Charts**, the app provides instant visual feedback on macro distributions, helping users understand their diet at a glance.

## 🛠️ Google Services Integration
-   **Gemini 2.0 Flash API**: Powering the Meal Analyzer and the Smart Suggestion engine.
-   **Google Charts**: Visualizing macro distributions (Donut Charts) and health trends.
-   **Google Fonts (Inter & Outfit)**: Providing a premium, modern typography system.
-   **Google Material Symbols**: Ensuring a consistent and accessible icon set.

## 🔒 Security & Privacy
-   **Runtime API Key**: We never hardcode API keys. Users provide their key at runtime, which is stored in `sessionStorage` (cleared when the tab is closed).
-   **Sanitized Inputs**: All user inputs are handled using safe DOM methods to prevent XSS attacks.
-   **Local Storage**: Personal data (weight, age, meal history) remains on the user's device.

## ♿ Accessibility
-   **Semantic HTML5**: Using proper landmarks (`<nav>`, `<main>`, `<aside>`) for screen readers.
-   **ARIA Labels**: All interactive elements have descriptive labels.
-   **Color Contrast**: Designed with high-contrast glassmorphism to meet WCAG AA standards.
-   **Keyboard Navigation**: Full support for `tab` navigation with visible focus states.

## 🧪 Testing
The project includes a `tests.js` suite that validates:
-   BMI calculation logic.
-   Calorie summation accuracy.
-   Time-of-day detection.

---
Built with ❤️ using Google Antigravity.
