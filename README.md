# ElderCare Connect - Politeknik Kuching Sarawak

ElderCare Connect is a modern, real-time application built with Next.js and Firebase, designed to bridge the gap between elderly residents and student volunteers at Politeknik Kuching Sarawak.

## Project Overview
ElderCare Connect is a community-driven digital platform that serves as a bridge between generations. It allows elderly residents to request help with daily tasks while providing student volunteers a streamlined way to contribute to their community through a secure, mobile-first interface.

## Product Description
1. **A Real-Time Assistance Hub**: A centralized platform where seniors can post requests for groceries, transportation, or technical support, which are immediately visible to nearby student volunteers.
2. **Volunteer Engagement Suite**: A dedicated interface for students to browse, accept, and manage community service tasks, allowing them to track their contributions and communicate directly with those they are helping.
3. **AI-Enhanced Communication**: An intelligent system featuring 1-on-1 persistent chat and Gemini-powered task descriptions to ensure clarity and reliability in every interaction.

## Problem Statement
Seniors often face significant hurdles with daily logistics and the rapidly evolving digital landscape, leading to a loss of independence. Meanwhile, students at Politeknik Kuching Sarawak frequently seek meaningful ways to give back but lack a structured, reliable tool to discover and coordinate with seniors who need their help.

## Impact
The app transforms the campus into a proactive care network, enhancing the quality of life for seniors through immediate support while equipping students with valuable social responsibility and leadership skills through community service.

## Objective
To provide a secure, user-friendly, and efficient digital solution that automates the matching of elderly needs with student availability, ensuring timely assistance and fostering intergenerational connections.

## 🚀 How to Move to your Local Machine (VS Code)

To move this project from Firebase Studio to your local **VS Code**, follow these steps in order:

### 1. Push from Firebase Studio to GitHub
In the terminal here in Firebase Studio:
```bash
git add .
git commit -m "Updated features in ElderCare Connect"
# Ensure your remote is set (only needed once)
# git remote add origin <YOUR_GITHUB_REPO_URL>
git push
```

### 2. Clone to your Local Machine (PC/Laptop)
On your own computer, open your terminal (Command Prompt, PowerShell, or Terminal) and run:
```bash
# Go to the folder where you want to save the project
cd Documents
# Clone the repository
git clone <YOUR_GITHUB_REPO_URL>
# Enter the project folder
cd ElderCare-Connect
# Install the necessary packages
npm install
```

---

## 📱 How to Convert to Android App (APK)

To convert this project into an Android APK, follow these steps exactly in your local VS Code terminal.

### Prerequisites
1. **Node.js** and **Android Studio** installed on your computer.
2. The code must be cloned locally.

### Step 1: Prepare the Build (IMPORTANT)
Run this command to create the static files for the app. This generates the `out` folder:
```bash
npm run build
```

### Step 2: Initialize Capacitor (Fixes "missing www" error)
Run this command to initialize Capacitor and point it to the correct `out` directory:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init ElderCare com.pks.eldercare --web-dir out
npx cap add android
```

### Step 3: Sync the Project (FIXES GRADLE ERROR)
This generates the missing Gradle files for Android Studio:
```bash
npx cap sync android
```

### Step 4: Build APK in Android Studio
1. Run `npx cap open android`. This opens **Android Studio**.
2. **Wait** for the loading bar at the bottom to finish (indexing/Gradle sync).
3. Go to: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4. Once finished, click **Locate** in the popup to find your `app-debug.apk`.

### 💡 Troubleshooting "Missing capacitor.settings.gradle" or "missing www"
1. **Always run `npm run build`** before syncing.
2. If it still says `missing www`, ensure your `capacitor.config.json` has `"webDir": "out"`.
3. If Android Studio is already open, run `npx cap sync android` and then click **File > Sync Project with Gradle Files** inside Android Studio.
