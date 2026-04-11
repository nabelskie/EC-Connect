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
git init
git add .
git commit -m "Initial commit of ElderCare Connect"
# Create a new repository on GitHub.com first, then link it:
git remote add origin <YOUR_GITHUB_REPO_URL>
git branch -M main
git push -u origin main
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

### 3. Updating GitHub with New Changes
Whenever you make changes in Firebase Studio and want them to appear on GitHub, run these commands in the Firebase Studio terminal:
```bash
git add .
git commit -m "Updated features in ElderCare Connect"
git push
```
Then on your local machine, run `git pull` to get those changes.

---

## 📱 How to Convert to Android App (APK)

To convert this project into an Android APK, you must use your local computer (VS Code) and **Capacitor**.

### Prerequisites
1. **Node.js** installed on your computer.
2. **Android Studio** installed on your computer.
3. The code must be cloned to your local machine from GitHub (see step 2 above).

### Step 1: Prepare Next.js for Mobile
Open `next.config.ts` and ensure it has `output: 'export'`.

### Step 2: Install Capacitor
In your local terminal (VS Code), run:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init ElderCare com.pks.eldercare web
```

### Step 3: Build the Project
Create a static build of your website:
```bash
npm run build
```

### Step 4: Add Android Platform
Link your code to the Android system:
```bash
npx cap add android
npx cap copy
```

### Step 5: Generate APK in Android Studio
1. Run `npx cap open android`. This will open **Android Studio**.
2. Wait for the project to load (indexing).
3. In Android Studio, go to: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4. Once finished, a popup will appear. Click **Locate** to find your `app-debug.apk` file.

---
*Built for Politeknik Kuching Sarawak - Connecting Generations.*