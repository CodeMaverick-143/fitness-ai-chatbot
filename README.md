# Fitness AI Chatbot (Track A)

A personalized fitness companion built with React Native (Expo) and powered by **Google Gemini**.

## Features

- **AI-Powered Chat**: Uses `gemini-flash-latest` for responsive, context-aware fitness advice.
- **Adaptive Personas**:
  - **Encourager**: Empathetic and supportive (Day 1-3).
  - **Friendly**: Casual tips and motivation (Day 4-8).
  - **Coach**: Strict, results-oriented discipline (Day 9+).
- **Safety First**:
  - Explicitly refuses advice on injuries, medical conditions, and medications.
  - Professional medical disclaimers on the Welcome Screen.
- **Persistent History**: Chat history and user context are preserved.
- **Optimized UI**:
  - Dark mode aesthetic.
  - Keyboard handling for seamless typing on Android & iOS.
  - Auto-scrolling chat interface.

## Tech Stack

- **Frontend**: React Native (Expo), TypeScript.
- **Backend**: Node.js, Express, Prisma, PostgreSQL.
- **AI**: Google Gemini API (`@google/generative-ai`).

## Setup & Installation

### 1. Backend Setup
The backend handles AI processing and database interactions.

```bash
cd backend
npm install
```

**Environment Variables (.env)**
Create a `.env` file in the `backend` folder:
```env
DATABASE_URL="your_postgresql_url"
GEMINI_API_KEY="your_google_gemini_api_key"
PORT=3000
```

**Run Server**
```bash
npm start
```
*Server runs on port 3000.*

### 2. Frontend Setup (Mobile App)
The app connects to the local backend.

```bash
# Root directory
npm install
npx expo start
```

**Connectivity Note:**
The `API_URL` in `app/App.tsx` is configured to use the production backend on Render (`https://fitness-ai-chatbot-backend.onrender.com/chat`).
- **If you want to use a local backend**, update `API_URL` to `http://10.254.200.254:3000/chat` (or your machine's IP).

## Publishing (Build for App Store/Play Store)

This project is configured for **EAS Build** (Expo Application Services).

1.  **Install EAS CLI**:
    ```bash
    npm install -g eas-cli
    ```

2.  **Login to Expo**:
    ```bash
    eas login
    ```

3.  **Configure Build**:
    ```bash
    eas build:configure
    ```

4.  **Create a Build**:
    - **Android (APK/AAB)**:
      ```bash
      eas build --platform android
      ```
    - **iOS (IPA - requires Developer Account)**:
      ```bash
      eas build --platform ios
      ```

For more details, see the [Expo Build Documentation](https://docs.expo.dev/build/introduction/).

## Important Disclaimers
This is an AI experiment, **not a medical device**.
- It does **not** diagnose injuries.
- It does **not** prescribe medications.
- Always consult a professional doctor for health issues.

## Testing
- **Welcome Screen**: Verify medical disclaimers are visible.
- **Chat**: Test different personas by toggling the "Day" count in the header.
- **Safety**: Try asking about "broken bone" or "diabetes" to verify refusal logic.
