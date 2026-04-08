# ElderCare Connect - Politeknik Kuching Sarawak

ElderCare Connect is a modern, real-time application built with Next.js and Firebase, designed to bridge the gap between elderly residents and student volunteers at Politeknik Kuching Sarawak.

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

### 2. Setup on your local machine
Once the code is on GitHub:
1. **Clone**: Open your local terminal and run `git clone <YOUR_GITHUB_REPO_URL>`.
2. **Open**: Open the folder in VS Code.
3. **Install**: Run `npm install` to install all dependencies.
4. **Environment**: Ensure your `src/firebase/config.ts` matches your project settings.
5. **Run**: Run `npm run dev` to start the local preview at `http://localhost:3000`.

## Firebase Console Tracking

You can monitor all activity in real-time by visiting your [Firebase Console](https://console.firebase.google.com/).
- **Firestore**: Check `assistance_requests_pending`, `assistance_requests_active`, and `assistance_requests_completed` to see task movement.
- **Authentication**: Manage user accounts (Admins use `adminkn@gmail.com`).
- **Cloud Messaging**: View registered `fcmToken` strings in user profiles.

---
*Built for Politeknik Kuching Sarawak - Connecting Generations.*