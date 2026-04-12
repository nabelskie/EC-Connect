
# ElderCare Connect - Mobile Build Guide

## 🚨 CRITICAL: Fix for Build Errors
If your build fails with "Webpack Error" or "generateStaticParams Error", perform these steps:

1. **Delete Folders**: In VS Code Sidebar, **DELETE** these folders:
   - `src/app/chat/[requestId]`
   - `src/app/dashboard/chat/[requestId]`
   *(These folders conflict with Android builds. Use the detail page instead)*

2. **Sync the Fixes**: Run these in your VS Code terminal:
   ```bash
   git reset --hard origin/main
   git pull
   npm install
   ```

## 🚀 How to Build the APK (Step-by-Step)

### Phase 1: Preparation
Ensure you are inside the **EC-Connect** folder in VS Code.

```bash
npm install
```

### Phase 2: Create Web Assets
```bash
npm run build
```
*Note: This creates the `out` folder. If it fails, ensure the [requestId] folders mentioned above are deleted.*

### Phase 3: Capacitor Setup (First time only)
```bash
npx cap init ElderCare com.pks.eldercare --web-dir out
npx cap add android
```

### Phase 4: Sync & Generate APK
1. **Sync code to Android Studio**:
   ```bash
   npx cap sync android
   ```
2. **Open Android Studio**:
   ```bash
   npx cap open android
   ```
3. **In Android Studio**:
   - Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - Once finished, click "Locate" in the bottom right pop-up to find your `app-debug.apk`.

## 📂 Troubleshooting Folder Structure
Make sure your VS Code shows `src`, `app`, and `public` directly in the sidebar. If you see another folder named `EC-Connect` inside VS Code, you are "one level too high". Go to **File > Open Folder** and select the inner `EC-Connect` folder.
