# FocusFlow - AI Study Planner & Productivity Coach

## Overview
FocusFlow is a comprehensive study management platform designed for students. It uses AI to generate personalized study schedules, tracks productivity through focus sessions, and provides deep analytics on study habits.

## Features
- **AI Study Schedule Generator**: Personalized timetables based on subjects and exam dates.
- **Task & Deadline Manager**: Stay on top of your assignments.
- **Productivity Tracker**: Pomodoro timer and focus session logging.
- **Performance Analytics**: Visualized progress and efficiency charts.
- **Smart Reminders**: Never miss a study session.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Recharts, Lucide Icons, Framer Motion.
- **Backend**: Node.js Express.
- **Database**: Firebase (Firestore & Auth).
- **AI**: Google Gemini API.

## Setup Instructions
1. **Environment Variables**:
   - `GEMINI_API_KEY`: Your Google AI SDK key.
   - `APP_URL`: The URL of the application.
2. **Firebase Setup**:
   - The app uses Firebase for real-time data and authentication.
   - Ensure `firebase-applet-config.json` is present and valid.
3. **Running Locally**:
   - `npm install`
   - `npm run dev`
