# ElderCare Connect - Politeknik Kuching Sarawak

ElderCare Connect is a modern, real-time application built with Next.js and Firebase, designed to bridge the gap between elderly residents and student volunteers at Politeknik Kuching Sarawak.

## Key Features

- **Role-Based Dashboards**: Tailored experiences for Residents, Volunteers, and Administrators.
- **Real-Time Assistance**: Residents can request help for Groceries, Transport, or Tech Support.
- **AI-Powered Refinement**: Uses Google Genkit (Gemini) to help residents write clearer task descriptions and provide admins with system insights.
- **Persistent Chat**: Secure, 1-on-1 messaging history between residents and volunteers.
- **Automated Workflow**: Tasks move seamlessly from Pending to Active to Completed, with full visibility in the Firebase Console.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI**: Google Genkit with Gemini 2.5 Flash
- **Styling**: Tailwind CSS & ShadCN UI

## How to Sync with GitHub

To push this project to your own GitHub repository, follow these steps in your terminal:

1. **Initialize a local Git repository**:
   ```bash
   git init
   ```

2. **Add your files to the staging area**:
   ```bash
   git add .
   ```

3. **Commit the files**:
   ```bash
   git commit -m "Initial commit of ElderCare Connect"
   ```

4. **Create a new repository on GitHub**. Do not initialize it with a README, license, or gitignore.

5. **Link your local repository to GitHub and push**:
   ```bash
   git remote add origin <YOUR_GITHUB_REPO_URL>
   git branch -M main
   git push -u origin main
   ```

## Firebase Console Tracking

You can monitor all activity in real-time by visiting your Firebase Console.
- **Firestore**: Check the `assistance_requests_*` collections to see task movement.
- **Authentication**: Manage user accounts and administrative roles.
- **Genkit**: Monitor AI flow executions and performance.
