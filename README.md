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

## Key Features
- **Role-Based Dashboards**: Tailored experiences for Residents (Elderly), Volunteers (Students), and Administrators.
- **Persistent 1-on-1 Chat**: Message history is preserved between users across different assistance requests.
- **Real-Time Assistance Tracking**: Monitor requests as they move from Pending to Active to Completed in the Firebase Console.
- **AI-Powered Assistance**: 
  - **Residents**: Get help writing clear task descriptions with Gemini.
  - **Admins**: Receive automated system performance summaries.
- **Push Notifications**: Integrated Firebase Cloud Messaging (FCM) to alert users of new requests and messages.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI**: Google Genkit with Gemini 2.5 Flash
- **Styling**: Tailwind CSS & ShadCN UI

## How to Sync with GitHub (Move to VS Code)

To move this project from Firebase Studio to your local **VS Code**, follow these steps:

### 1. Push from Firebase Studio to GitHub
In the terminal here in Firebase Studio:
```bash
git init
git add .
git commit -m "Initial commit of ElderCare Connect"
# Create a new repo on GitHub.com first, then:
git remote add origin <YOUR_GITHUB_REPO_URL>
git branch -M main
git push -u origin main
```

### 2. Updating GitHub with New Changes
When you make changes in Firebase Studio and want them to appear on GitHub, run these commands in the terminal:
```bash
git add .
git commit -m "Updated features in ElderCare Connect"
git push
```

### 3. Setup on your local machine (VS Code)
Once the code is on GitHub:
1. **Clone**: Open your local terminal and run `git clone <YOUR_GITHUB_REPO_URL>`.
2. **Open**: Open the folder in VS Code.
3. **Install**: Run `npm install` to install all dependencies.
4. **Environment**: Ensure your `src/firebase/config.ts` matches your project settings.
5. **Run**: Run `npm run dev` to start the local preview at `http://localhost:3000`.

---
*Built for Politeknik Kuching Sarawak - Connecting Generations.*