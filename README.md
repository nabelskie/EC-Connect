
# 📱 ElderCare Connect - Master Build Guide

This guide explains how to take the code from this browser environment and turn it into a high-quality **Android (APK)** or **iOS (IPA)** application.

---

## 🛠️ Step 1: Preparation (One-Time Setup)

You need the following installed on your physical computer:
1.  **Node.js**: [Download here](https://nodejs.org/).
2.  **Android Studio**: (For Android) [Download here](https://developer.android.com/studio).
3.  **Xcode**: (For iPhone - Mac only) Install via App Store.

---

## 🚀 Step 2: Download & Build

1.  **Clone your code**:
    On your local machine, open your terminal (VS Code Terminal) and run:
    ```bash
    git clone [YOUR_REPO_URL]
    cd [YOUR_REPO_NAME]
    npm install
    ```

2.  **Export for Mobile**:
    Next.js needs to be "exported" into static files that a phone can understand. Run:
    ```bash
    npm run app:build
    ```
    *This generates an `out` folder and syncs it with the Android/iOS projects.*

---

## 🎙️ Step 3: Enabling Voice Chat (Permissions)

For the **Voice Message** feature to work, you MUST manually add microphone permissions to your native projects.

### For Android:
1. Open `android/app/src/main/AndroidManifest.xml`.
2. Add these lines inside the `<manifest>` tag but outside `<application>`:
   ```xml
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
   ```

### For iOS:
1. Open your project in Xcode.
2. Go to the **Info** tab of your App Target.
3. Add a new key: `Privacy - Microphone Usage Description`.
4. Set the value to: `This app needs access to your microphone to record and send voice messages to community members.`

---

## 🤖 Step 4: Generate Android APK

1.  **Open in Android Studio**:
    ```bash
    npm run app:open:android
    ```
2.  **Inside Android Studio**:
    - Wait for the **Gradle Sync** (the bar at the bottom) to finish.
    - Go to the top menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
    - When the popup appears in the bottom-right, click **Locate**.
    - Find `app-debug.apk`. You can send this file to any Android phone to install it!

---

## 🍎 Step 5: Generate iOS App (Mac Only)

1.  **Open in Xcode**:
    ```bash
    npm run app:open:ios
    ```
2.  **Inside Xcode**:
    - Select your **Target** (ElderCare) and click the **Signing & Capabilities** tab.
    - Select your development team to sign the app.
    - Plug in your iPhone and click the **Play** button at the top left to install it.

---

## 💡 Pro Tips for a Professional Finish

- **Splash Screens**: You can change the loading icon by replacing the files in `android/app/src/main/res/mipmap`.
- **App Name**: You can change the display name (e.g., from "ElderCare" to "PKS Connect") in `capacitor.config.json`.
- **Firebase Config**: Ensure your `src/firebase/config.ts` has the correct production keys from your Firebase Console.

---

## 🔐 Admin Credentials (Reminders)
- **Admin Email**: `adminkn@gmail.com`
- **Initial Password**: `knadmin123`
