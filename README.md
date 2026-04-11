# ElderCare Connect - Politeknik Kuching Sarawak

ElderCare Connect is a modern, real-time application built with Next.js and Firebase, designed to bridge the gap between elderly residents and student volunteers at Politeknik Kuching Sarawak.

## Project Overview
ElderCare Connect is a community-driven digital platform that serves as a bridge between generations. It allows elderly residents to request help with daily tasks while providing student volunteers a streamlined way to contribute to their community through a secure, mobile-first interface.

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
2. Click **Clone Git Repository** on the welcome screen (or go to `File > New Window` and click `Clone Repository`).
3. Paste your GitHub URL.
4. Select a folder on your computer to save it.

### 3. Install & Run
Open the **Terminal** in VS Code (Ctrl+`) and run:
```bash
npm install
```

---

## 📱 How to Convert to Android App (APK)

Follow these steps exactly in your local VS Code terminal to create your APK.

### Step 1: Prepare the Build
This creates the static files needed for a mobile app (the `out` folder):
```bash
npm run build
```

### Step 2: Initialize Capacitor
Run this command to point Capacitor to the correct `out` directory:
```bash
npx cap init ElderCare com.pks.eldercare --web-dir out
npx cap add android
```

### Step 3: Sync the Project
This generates the Gradle files for Android Studio:
```bash
npx cap sync android
```

### Step 4: Build APK in Android Studio
1. Run `npx cap open android`. This opens **Android Studio**.
2. **Wait** for the loading bar at the bottom to finish.
3. Go to: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4. Once finished, click **Locate** in the popup to find your `app-debug.apk`.

---

## 🚀 How to Update your Local Code
If you made changes here in Firebase Studio later and want them on your computer:

1. **Push from Firebase Studio** (using the commands in section 1.1).
2. **In VS Code**, click the "Sync" icon in the bottom left or run:
```bash
git pull
npm run build
npx cap sync android
```

---

## 💡 Troubleshooting "Missing www" or Gradle Errors
1. **Always run `npm run build`** before syncing.
2. If Android Studio says `missing capacitor.settings.gradle`, close Android Studio and run `npx cap sync android` in VS Code first.
