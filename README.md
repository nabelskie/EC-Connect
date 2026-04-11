# ElderCare Connect - Politeknik Kuching Sarawak

ElderCare Connect is a modern, real-time application built with Next.js and Firebase, designed to bridge the gap between elderly residents and student volunteers at Politeknik Kuching Sarawak.

## 🔄 How to Move to your Local Machine (Initial Setup)

To move this project from Firebase Studio to your local **VS Code** for the first time:

### 1. Push from Firebase Studio (here)
Open the terminal at the bottom of Firebase Studio and run:
```bash
git add .
git commit -m "Ready for local build"
git push
```

### 2. Clone in VS Code
1. Open **VS Code** on your computer.
2. Click **Clone Git Repository** on the welcome screen.
3. Paste your GitHub URL.
4. Select a folder on your computer to save it.

### 3. Install & Run
Open the **Terminal** in VS Code (Ctrl+`) and run:
```bash
npm install
npm run build
npx cap init ElderCare com.pks.eldercare --web-dir out
npx cap add android
npx cap sync android
```

---

## 🛠️ CRITICAL: How to Fix "Build Errors" or "Git Pull" Errors
If you see errors about `[requestId]` or `generateStaticParams`, or if you cannot pull updates, run these commands in your **VS Code terminal**:

1. **Force Sync (Resets local to match GitHub):**
   ```bash
   git reset --hard origin/main
   git pull
   ```
2. **Re-build:**
   ```bash
   npm install
   npm run build
   npx cap sync android
   ```
*This clears local conflicts and brings in the latest fixes from Firebase Studio.*

---

## 📱 How to Convert to Android App (APK)

1. **Prepare the Build**:
   ```bash
   npm run build
   ```
2. **Sync the Project**:
   ```bash
   npx cap sync android
   ```
3. **Build APK in Android Studio**:
   1. Run `npx cap open android`.
   2. Wait for the indexing to finish.
   3. Go to: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 🚀 How to Update your Local Code
If you made changes here in Firebase Studio and want them on your computer:
1. **Push from Firebase Studio**.
2. **In VS Code**, run:
   ```bash
   git pull
   npm run build
   npx cap sync android
   ```
