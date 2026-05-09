# 🧠 SaynIQ - AI-Powered Second Brain

Welcome to the official repository of **SaynIQ**, a premium AI productivity platform. This repository contains both the mobile application and the marketing landing page.

---

## 📁 Repository Structure

```text
/
├── website/             # React.js Marketing Landing Page
└── SaynIQ App/          # React Native (Expo) Mobile Application
```

---

## 🚀 Website Setup (React.js)

The landing page is built with **React**, **Tailwind CSS**, and **Framer Motion**.

### Setup Steps:
1. Navigate to the website directory:
   ```bash
   cd website
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run locally:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

### Deployment:
- **GitHub Pages**: Use the `gh-pages` branch or configure a GitHub Action to deploy from the `website` folder.
- **Vercel/Netlify**: Link the repository and set the root directory to `website`.

---

## 📱 Mobile App Setup (React Native / Expo)

The mobile app is a professional "Second Brain" tool powered by AI.

### Setup Steps:
1. Navigate to the app directory:
   ```bash
   cd "SaynIQ App"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Expo:
   ```bash
   npx expo start
   ```

### Commands:
- `npx expo start`: Launch the development server.
- `npx eas build -p android --profile production`: Build production APK.
- `npx expo run:android`: Run on an Android emulator/device.

---

## ✨ Features

### Mobile App
- **AI Notes & Chat**: Intelligent knowledge processing.
- **Knowledge Hub**: Centralized research vault.
- **Secure Vault**: Encrypted password management.
- **Task & Focus**: Productivity tracking with daily streaks.

### Landing Page
- **Premium Design**: Modern AI startup aesthetic.
- **Interactive UI**: Animated sections and glassmorphism.
- **Direct APK Access**: Seamless download flow.

---

## 👨‍💻 Developer
**Sayan Banerjee**  
*Lead Architect & AI UI Designer*

---
<p align="center">
  Built with ❤️ for a smarter tomorrow.
</p>
