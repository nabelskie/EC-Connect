
# ElderCare Connect - Mobile Build Guide

## ✅ Step 1: Success! Build Completed
Your `out` folder has been generated. Now we move to the final phase: **Android APK Generation**.

## 🚀 Final Phase: Generate APK

### 1. Capacitor Initialization
Run this in your VS Code terminal to set up the mobile configuration:
```bash
npx cap init ElderCare com.pks.eldercare --web-dir out
```

### 2. Add Android Platform
```bash
npx cap add android
```

### 3. Sync & Open
Sync your code to the Android project and open it in Android Studio:
```bash
npx cap sync android
npx cap open android
```

### 4. In Android Studio
Once Android Studio opens:
1.  **Wait**: Look at the bottom status bar and wait for "Gradle Sync" to finish.
2.  **Build**: Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3.  **Locate**: When the popup appears in the bottom-right, click **Locate** to find your `app-debug.apk`.

## 📂 Troubleshooting Build Errors
If `npm run build` fails again in the future:
1. **Delete Folders**: Manually delete `src/app/chat/[requestId]` and `src/app/dashboard/chat/[requestId]`.
2. **Update Config**: Ensure `next.config.ts` has the Webpack "Ignore" aliases for Node.js modules.
3. **Clean Start**:
   ```bash
   git reset --hard origin/main
   npm install
   npm run build
   ```
