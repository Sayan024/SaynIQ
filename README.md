![SaynIQ Banner](file:///C:/Users/sayan/.gemini/antigravity/brain/f8dae0dd-8caa-41e8-810c-529eb6273fc6/sayniq_banner_1778311432702.png)

# SaynIQ 🧠✨
### The Ultimate AI-Powered Knowledge Hub & Second Brain

SaynIQ is a premium, high-performance mobile application designed to transform how you capture, organize, and interact with your digital knowledge. Built with a "Drops Purple" aesthetic and powered by Google's Gemini AI, SaynIQ acts as your personal cognitive assistant—summarizing links, answering questions about your notes, and ensuring you never lose a valuable insight again.

---

## 🚀 Key Features

### 💎 Intelligent Knowledge Hub
- **Universal Capture**: Seamlessly save long-form notes, code snippets, and web links.
- **Auto-Metadata**: Automatically fetches titles, thumbnails, and domains for saved links to keep your vault organized.
- **Smart Filtering**: Advanced category-based organization and lightning-fast search.

### 🤖 Gemini AI Integration
- **Contextual Chat**: Chat directly with your "Second Brain". Ask questions about your own notes and links.
- **Instant Summarization**: Get high-quality AI summaries of web articles and YouTube videos without leaving the app.
- **Smart Insights**: AI-driven analysis of your study material to help you learn faster.

### 🔗 Premium Sharing & Deep Linking
- **SaynIQ Share**: Generate professional, clean Universal Links (`sayn-iq.vercel.app/share`) to send content to other devices.
- **Auto-Import**: Clicking a shared link launches SaynIQ and imports the content instantly into the Knowledge Hub.
- **App Not Installed Flow**: Gracefully redirects users to the official website if the app isn't installed.

### 🔔 Smart Productivity Tools
- **Robust Reminders**: Set time-based notifications for important notes or "Read Later" links.
- **Success Feedback**: Premium animations and haptic feedback for every save and import operation.
- **Custom Themes**: Experience the stunning "Drops Purple" UI designed for maximum focus and aesthetic pleasure.

---

## 🛠 Tech Stack

- **Frontend**: React Native with Expo (SDK 54)
- **AI Engine**: Google Gemini AI (Generative AI SDK)
- **Navigation**: React Navigation (Native Stack & Bottom Tabs)
- **Styling**: Vanilla CSS-in-JS with Dynamic Theming
- **Storage**: AsyncStorage for high-speed local persistence
- **Notifications**: Expo Notifications
- **Sharing**: Expo Sharing & Expo Linking (Universal Links)

---

## 🏗 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Expo Go app on your mobile device (for development)
- A Google Gemini API Key

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sayan024/SaynIQ.git
   cd SaynIQ
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start Development Server**
   ```bash
   npx expo start
   ```

---

## 📦 Building for Production (Android APK)

SaynIQ uses Expo Application Services (EAS) for production builds.

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Build the APK**
   ```bash
   npx eas build -p android --profile production --non-interactive
   ```

---

## 📜 Architecture

SaynIQ follows a modular, service-oriented architecture:
- `src/screens`: UI screens and navigation logic.
- `src/components`: Reusable UI elements (ItemCards, Modals, GlassContainers).
- `src/services`: Core logic for AI (Gemini), Notifications, Sharing, and Metadata fetching.
- `src/context`: State management via `VaultContext` for global data persistence.
- `src/styles`: Theme engine and global style tokens.

---

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request or open an issue for feature requests.

**SaynIQ** — *Organize your mind, power your life.*
