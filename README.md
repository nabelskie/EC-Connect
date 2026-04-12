
# ElderCare Connect - Mobile Build Guide

## 🚨 CRITICAL: Fix for Build Errors
If your build fails with "Webpack Error" or "generateStaticParams Error", perform these steps:

1. **Delete Folders**: In VS Code, **DELETE** these folders:
   - `src/app/chat/[requestId]`
   - `src/app/dashboard/chat/[requestId]`
   *(These are old folders that conflict with Android builds)*

2. **Sync the Fixes**: Run these in your VS Code terminal:
   ```bash
   git reset --hard origin/main
   git pull
   npm install
   ```

## 🚀 How to Build the APK

1. **Build Web Assets**:
   ```bash
   npm run build
   ```
   *Note: This creates the `out` folder. If it fails, ensure the [requestId] folders are deleted.*

2. **Initialize Capacitor** (Only if you haven't done it):
   ```bash
   npx cap init ElderCare com.pks.eldercare --web-dir out
   npx cap add android
   ```

3. **Sync to Android**:
   ```bash
   npx cap sync android
   ```

4. **Generate APK**:
   ```bash
   npx cap open android
   ```
   In Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
