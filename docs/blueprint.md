# **App Name**: ElderCare Connect

## Core Features:

- Secure Authentication & Authorization: Email/password registration, login, logout, and role-based access (elderly, volunteer, admin) powered by Firebase Authentication.
- Assistance Request Management: Elderly users/caregivers can create assistance requests with task details, location, and urgency; volunteers can view and accept available requests; administrators can oversee all requests.
- Real-time Communication: Secure in-app chat enabling direct communication between an elderly user/caregiver and their assigned volunteer for task coordination, using Firestore for real-time updates.
- AI Task Description Tool: A generative AI tool assisting elderly users/caregivers in crafting clear, comprehensive descriptions for their assistance requests, ensuring all necessary details are captured.
- Task Status Tracking & Updates: Volunteers can update task statuses (Accepted, In Progress, Completed), providing transparency to elderly users, who can view their request's current status.
- Volunteer Rating & Task History: Elderly users/caregivers can rate and provide feedback on volunteer performance after task completion; volunteers can view their history of completed tasks.
- Admin Oversight Dashboard: A centralized dashboard for Politeknik staff to monitor user activity, manage assistance requests (including manual assignment), review system analytics, and remove inappropriate users.

## Style Guidelines:

- Primary color: A deep, muted indigo (#464673) to convey trust, stability, and professionalism, offering strong contrast against lighter backgrounds.
- Background color: A very light, desaturated grey-blue (#ECECF2) providing a serene and clean canvas that is gentle on the eyes.
- Accent color: A clear and vibrant sky blue (#3CA8DC) used for interactive elements, calls-to-action, and important notifications to draw immediate attention.
- Body and headline font: 'Inter' (grotesque-style sans-serif) for its modern, objective, and highly legible design, prioritizing accessibility for all users, especially the elderly.
- Utilize simple, universally recognizable SVG icons with clear forms and consistent styling, ensuring immediate comprehension for easy navigation by elderly users.
- A mobile-first, grid-based responsive layout with generous spacing and minimalistic design, prioritizing readability, large tap targets, and ease of navigation across all devices and for all user roles.
- Subtle and functional micro-animations for feedback on user interactions (e.g., button clicks, form submissions) and for gentle emphasis on real-time notifications and status changes.