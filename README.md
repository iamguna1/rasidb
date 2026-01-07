
# Legal & Financial Data Extractor (Web-Native)

A professional-grade tool for extracting structured data from legal and financial documents using **Gemini 3 Pro Vision Intelligence**.

## 🚀 Quick Start
This project uses a **Web-Native React** architecture (no local build tools required for development).

1. Clone the repository.
2. Serve the directory using any static server:
   ```bash
   npx serve .
   ```
3. Open `http://localhost:3000` in your browser.

## 📦 Deployment
Because this app uses an `importmap` in `index.html`, you do not need to run `npm run build` to generate a `dist` or `build/web` folder. 

**To Deploy:**
1. Simply push all files in the root directory to your host (GitHub Pages, Netlify, Vercel).
2. Ensure your host serves `index.html` as the entry point.

## 🛠 Tech Stack
- **React 19**: Modern UI rendering.
- **Tailwind CSS**: Rapid utility-first styling.
- **Gemini 3 Pro**: Advanced document reasoning and OCR.
- **Mail Merge**: Client-side `.docx` generation via `docxtemplater`.

## ⚠️ Note for Flutter Users
If you are coming from a Flutter background, please note:
- **No `build/web` folder**: Web-native apps serve source files directly or use a `dist` folder if bundled.
- **Standard Git workflow**: Use `git add .` to track all project files.
