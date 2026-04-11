# ElderCare Connect - Politeknik Kuching Sarawak

ElderCare Connect is a modern, real-time application built with Next.js and Firebase, designed to bridge the gap between elderly residents and student volunteers at Politeknik Kuching Sarawak.

---

## 🚀 COMPLETE GUIDE: Converting to Android App (APK)

Follow these steps **on your local computer** (Windows/macOS) to generate your mobile app.

### ⚠️ CRITICAL: Check your folder first!
When you open VS Code, ensure you have opened the **project folder directly** (e.g., `EC-Connect`). Your sidebar should show the `src` and `app` folders immediately. If you see another folder with your project name inside VS Code, you are "one level too high." Go to **File > Open Folder** and select that inner folder.

### Phase 1: Initial Setup (The "First Time" Only)
1. **Push from Firebase Studio**: In this window (Firebase Studio), run:
   ```bash
   git add .
   git commit -m "Finalizing mobile build config"
   git push
   ```
2. **Clone in VS Code**:
   - Open **VS Code** on your computer.
   - Click **Clone Git Repository** on the welcome screen.
   - Paste your GitHub URL and select a folder.
   - **Important**: When it finishes, VS Code will ask to "Open" the repository. Click **Open**.

3. **Install Dependencies**: Open the VS Code terminal (Ctrl+`) and run:
   ```bash
   npm install
   ```

### Phase 2: Building the Web Assets
This turns your code into a "static site" that Android can run locally.
1. **Build the project**:
   ```bash
   npm run build
   ```
   *Note: This creates a folder named `out`. If this fails, see the "Fixing Build Errors" section below.*

### Phase 3: Creating the Android Project
1. **Initialize Capacitor**:
   ```bash
   npx cap init ElderCare com.pks.eldercare --web-dir out
   ```
2. **Add Android Platform**:
   ```bash
   npx cap add android
   ```
3. **Sync your assets**:
   ```bash
   npx cap sync android
   ```

### Phase 4: Generating the APK (Android Studio)
1. **Open Android Studio**:
   ```bash
   npx cap open android
   ```
2. **Wait for indexing**: Let Android Studio finish "Indexing" (the progress bar at the bottom).
3. **Build APK**:
   - In the top menu, go to: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - Once finished, a notification will appear. Click **locate** to find your `app-debug.apk` file.

---

## 🔄 How to Update your App
If you make changes here in Firebase Studio and want to update the app on your phone:
1. **Push from Firebase Studio** (git add/commit/push).
2. **On your PC (VS Code)**, run:
   ```bash
   git reset --hard origin/main
   git pull
   npm install
   npm run build
   npx cap sync android
   ```
3. Open Android Studio and **Build APK** again.

---

## ⚠️ Troubleshooting Git & Build Errors
If you see errors like `generateStaticParams` or "git pull failed":

1. **Force Sync (Resets your PC to match GitHub exactly):**
   ```bash
   git reset --hard origin/main
   git pull
   ```
2. **Missing Script Error:**
   Ensure you are inside the correct folder. The terminal should show the folder name where your `package.json` is located. If not, use `cd your-folder-name`.

---

## 📱 Features
- **Real-time Chat**: Connect with volunteers instantly with unread message indicators.
- **AI Assistance**: Gemini-powered task descriptions for clarity.
- **Admin Dashboard**: Full system oversight for PKS administrators.
- **Push Notifications**: Stay updated with Firebase Cloud Messaging.
