# Couple Expense Tracker

## Setup
1. Create Firebase Project
2. Enable Email/Password Authentication
3. Create Firestore Database
4. Replace values in js/firebase-config.js
5. Create user in Firebase Auth
6. Push project to GitHub
7. Enable GitHub Pages

## Firestore Rules

rules_version = '2';
service cloud.firestore {
 match /databases/{database}/documents {
  match /transactions/{document=**} {
   allow read, write: if request.auth != null;
  }
 }
}

## Features
- Login
- Add Income
- Add Expense
- Member Tracking
- Category Tracking
- Pie Chart
- Bar Chart
- Member Comparison Chart
- Responsive UI

## Deploy
Settings -> Pages -> Deploy from branch -> main -> root.
