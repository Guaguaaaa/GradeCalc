# 📊 GradeCalc

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Tech](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20JS-orange.svg)

**GradeCalc** is a modern, privacy-focused academic grade calculator designed to help students plan their final exams with precision.

Unlike traditional calculators, GradeCalc features a "Product-Grade" UI with **Bento Grid** layouts and uses a **statistical algorithm (Z-Score & Gap Analysis)** to provide intelligent performance insights rather than just raw numbers.

> **Live Demo:** https://gradecalc.peterguan.com

---

## ✨ Key Features

* **🔒 Privacy First:** 100% Client-side processing. No data leaves your browser.
* **🎨 Modern Swiss UI:** Features a clean, editorial design style with "Bento Grid" dashboard layouts and glassmorphism effects.
* **🧠 Smart Analysis:**
    * Uses **Standard Deviation** and **Z-Score** calculations to determine if a goal is "Safe", "Challenging", or "Hard" based on your historical volatility.
    * Provides asymmetric feedback logic (recognizing that improving grades is harder than maintaining them).
* **📊 Visual Insights:**
    * **Stacked Bar Chart:** Visualizes Secured, Lost, and Potential scores.
    * **Goal Sandbox:** Interactive slider to simulate "What if" scenarios for your final grade.
* **🌐 Bilingual Support:** Seamless English / Chinese switching with state persistence.
* **📱 Responsive:** Optimized for both desktop (Split View) and mobile devices.

## 🛠️ Tech Stack

* **HTML5:** Semantic structure.
* **CSS3:** CSS Variables, Flexbox/Grid, Webkit styling for custom sliders, and SVG filters for texture.
* **JavaScript (ES6+):** Vanilla JS for DOM manipulation, statistical logic, and state management.
* **No Frameworks:** Lightweight and fast, zero dependencies.

## 🚀 Getting Started

Since this is a static website, deployment is instant.

### Local Development

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Guaguaaaa/GradeCalc.git
    ```
2.  **Run the app**
    * Simply open `index.html` in your browser.
    * Or use a lightweight server (e.g., Live Server in VS Code) for the best experience.

### Deployment

This project is ready for **GitHub Pages**, **Cloudflare Pages**, or **Vercel**.
Just upload the files and point the entry to `index.html`.

## 🧮 How the "AI" Works

GradeCalc doesn't just subtract numbers. It uses a **Rule-based Statistical Algorithm** to generate advice:

1.  **Gap Analysis:** Calculates the difference between the *Required Final Score* and your *Current Normalized Average*.
2.  **Volatility Check:** Calculates the *Standard Deviation (σ)* of your assignment history.
3.  **Z-Score Determination:**
    $$Z = \frac{\text{Required Final} - \text{Average}}{\sigma}$$
4.  **Decision Matrix:**
    * If $Z > 1.5$ (or Gap > 10): Rated as **Hard** (Requires outperforming your usual self).
    * If $Z < 0.5$: Rated as **Safe/Normal**.

## 📂 Project Structure

```text
GradeCalc/
├── index.html      # Main HTML structure (Split View Layout)
├── style.css       # Modern Swiss styling & Animations
├── script.js       # Core logic, I18n, and Statistics
├── LICENSE         # MIT License file
└── README.md       # Project documentation
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Created by Peter**