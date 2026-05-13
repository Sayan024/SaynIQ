# SaynIQ – Technical Architecture & Workspace Hub

SaynIQ is a Personal Intelligence Operating System built with a hub-and-spoke architecture, ensuring seamless bidirectional synchronization between Mobile (React Native) and Web (React/Vite).

## 🧠 Core Architecture

- **State Orchestration**: Managed via `WebVaultContext` (Web) and `VaultContext` (Mobile) using a real-time listener pattern.
- **Identity Layer**: Unified Firebase Authentication (Google Sign-In & Email/Password).
- **Data Persistence**: 
    - **Cloud**: Firebase Firestore (Global source of truth).
    - **Local (Mobile)**: AsyncStorage + SecureStore (AES-256 for passwords).
- **Sync Engine**: Bidirectional real-time sync using Firestore `onSnapshot` listeners.

## 📱 Functional Mapping (Web vs. Mobile)

### 1. 🚀 Smart Overview (`Dashboard.jsx`)
- **Purpose**: Mission control and AI-driven telemetry.
- **Key Features**: 
    - **Activity Heatmap**: Visualizes knowledge density over 7 days.
    - **AI Hub Metric**: Tracks items summarized by the Gemini Pro integration.
    - **Recently Added**: Instant access to the latest 3 notes or links added via mobile.
    - **Trending in Tech**: Real-time curated feed of high-impact technology shifts.

### 2. 📚 Knowledge Hub (`NotesHub.jsx` & `Library.jsx`)
- **Purpose**: Unified digital vault for long-form thoughts and web resources.
- **Key Features**: 
    - **Notes Hub**: Support for plain text and **Code Snippets** with syntax-aware display.
    - **Library**: Consolidates **Link Saver** (with domain-based iconography) and **Playlists** into a single library.
    - **Real-time Filters**: Search across titles, content, and categories.

### 3. 🎯 Task Hub (`TaskManager.jsx`)
- **Purpose**: High-performance productivity tracking.
- **Key Features**: 
    - **Checkmark Sync**: Toggling a task on the website reflects instantly on the mobile lock-screen widget.
    - **Due Date Tracking**: Integrated calendar pickers for deadline management.
    - **Productivity Progress**: Real-time progress bar on the Smart Overview.

### 4. 🤖 SaynIQ Copilot (`GlobalAIChat.jsx`)
- **Purpose**: Contextual RAG (Retrieval-Augmented Generation) assistant.
- **Key Features**: 
    - **Shortcut Access**: Triggered via `Cmd + J` or the floating bot FAB.
    - **Contextual Awareness**: Analyzes your vault contents to answer personalized questions.
    - **Minimized Mode**: Persistent accessibility without blocking the workspace.

### 5. 💰 Finance Hub (`FinanceHub.jsx`)
- **Purpose**: Secure, encrypted-view tracking of incomes and expenses.
- **Key Features**: 
    - **Balance Visualization**: Automatically calculates net worth from cloud transactions.
    - **Encrypted Ledger**: Shows a "Protected" status to indicate cloud-to-local encryption.

### 6. ⚙️ Workspace Settings (`Settings.jsx`)
- **Purpose**: Global configuration and security.
- **Key Features**: 
    - **Theme Switching**: Toggle between **Pink Obsidian** and **Blue Matrix** themes.
    - **Cloud Persistence**: Settings are saved to the user's `vaults/{uid}/metadata/settings` document.

## 🔄 Bidirectional Sync Logic

| Action | Platform | Cloud Persistence | Outcome |
| :--- | :--- | :--- | :--- |
| **Add Note** | Mobile | `vaults/{uid}/items` | Appears on Web Dashboard via `onSnapshot` |
| **Complete Task** | Web | `vaults/{uid}/metadata/tasks` | Mobile Task Hub updates state instantly |
| **Theme Change** | Web | `vaults/{uid}/metadata/settings` | Mobile app adapts theme on next launch |
| **Add Link** | Mobile | `vaults/{uid}/items` | Web Library updates via real-time listener |

## 🛠 Verification Plan

- **Handshake Test**: Add a note on the mobile app; verify it appears in the Web "Recently Added" section within < 500ms.
- **Conflict Resolution**: Update a task's due date on Web while the mobile app is in the background; verify the push notification/state update.
- **Recovery Test**: Logout and Login on a fresh browser; verify that `WebVaultContext` restores the entire environment from Firestore.

---
*Precision-engineered for the SaynIQ Intelligence Hub.*
