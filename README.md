# ElderCare Connect - Politeknik Kuching Sarawak

ElderCare Connect is a modern, real-time application built with Next.js and Firebase, designed to bridge the gap between elderly residents and student volunteers at Politeknik Kuching Sarawak.

---

## 🚀 COMPLETE GUIDE: Converting to Android App (APK)

### ⚠️ CRITICAL: Fix for "generateStaticParams" Error
If your build fails with an error about `generateStaticParams`, follow these steps:
1. **Delete Folders**: In your VS Code sidebar, find and **DELETE** these two folders:
   - `src/app/chat/[requestId]`
   - `src/app/dashboard/chat/[requestId]`
2. **Why?**: Android apps require "Static Exports," which don't allow these dynamic folder names. The app has been updated to use a safer method that doesn't need them.

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
1. **Build the project**:
   ```bash
   npm run build
   ```
   *Note: This creates the `out` folder. If it fails, make sure you deleted the [requestId] folders mentioned above.*

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
2. **Build APK**:
   - In the top menu, go to: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 🔄 How to Update your App
If you make changes here in Firebase Studio:
1. **Push from Firebase Studio** (git add/commit/push).
2. **On your PC (VS Code)**, run:
   ```bash
   git reset --hard origin/main
   git pull
   npm install
   npm run build
   npx cap sync android
   ```

## ⚠️ Troubleshooting
- **"npm warn deprecated"**: Ignore it. It is normal.
- **"Could not find the web assets directory: .\out"**: Run `npm run build` first.
- **"git pull failed"**: Run `git reset --hard origin/main`.
