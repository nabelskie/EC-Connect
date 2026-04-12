
# ElderCare Connect - Mobile Build Guide

## ✅ Step 1: Success! Build Completed
Your `out` folder has been generated and synced. Now we move to the final phase: **Android APK Generation**.

## 🚀 Final Phase: Generate APK

### 1. Open Android Studio
Run this in your VS Code terminal:
```bash
npx @capacitor/cli open android
```

### 2. In Android Studio (IMPORTANT)
1.  **Wait**: Look at the bottom status bar and wait for "Gradle Sync" to finish. If it asks to update anything, you can usually skip or "Remind me later".
2.  **Build**: Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3.  **Locate**: When the popup appears in the bottom-right, click **Locate** to find your `app-debug.apk`.

## 📂 Troubleshooting Build Errors
If you ever need to run `npm run build` again and it fails:
1. **Delete Folders**: Manually delete `src/app/chat/[requestId]` and `src/app/dashboard/chat/[requestId]` in VS Code.
2. **Clean Start**:
   ```bash
   git reset --hard origin/main
   npm install
   npm run build
   npx @capacitor/cli sync android
   ```

## 🔐 Credentials
- **Admin Email**: `adminkn@gmail.com`
- **Initial Password**: `knadmin123`
