# FeedbackHub 🚀

FeedbackHub is a full-stack customer feedback management platform. It allows users to submit feedback, and admins to analyze trends using a sentiment analysis engine and a visual dashboard.

## 🌟 Features

- **Feedback Submission**: Public form with category selection.
- **Sentiment Analysis**: Automatic scoring and urgency detection.
- **AI Summary**: Intelligent aggregation of recent feedback trends.
- **Analytics Dashboard**: Visual charts for sentiment and category distribution.
- **Admin Portal**: Secure JWT-protected management area.
- **Export Data**: Download feedback as CSV or JSON.
- **Responsive Design**: Works on desktop and mobile.

---

## 💻 Local Development

To run this project locally on your machine, follow these steps:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

### 2. Installation
Clone the repository or download the source code, then navigate to the project folder:

```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory (you can copy from `.env.example`):

```env
JWT_SECRET=your_secret_key_here
ADMIN_USER=admin
ADMIN_PASS=admin123
```

### 4. Run the Application
Start the development server (Express + Vite):

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## ☁️ Deployment

### Deploying to Vercel

FeedbackHub is designed to be deployable on Vercel. However, please note the following:

1. **Database**: This app uses **SQLite** (`feedback.db`) by default. Vercel's file system is ephemeral, meaning any data saved to the SQLite file will be lost when the server restarts. 
   - **For Production**: You should replace the SQLite logic in `db.ts` with a cloud database like **Supabase (PostgreSQL)** or **Vercel Postgres**.
2. **Configuration**:
   - The `vercel.json` file is already included to handle the Express backend.
   - Set your Environment Variables (`JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASS`) in the Vercel Dashboard.

### Deployment Steps:
1. Push your code to a GitHub repository.
2. Connect the repository to Vercel.
3. Ensure the **Build Command** is `npm run build` and the **Output Directory** is `dist`.
4. Add your environment variables.
5. Deploy!

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide React, Motion.
- **Backend**: Node.js, Express, JWT, BcryptJS.
- **Database**: SQLite (better-sqlite3).
- **Analysis**: Custom Sentiment & NLP Engine.

---

## 📄 License

MIT License. Built by Shabeer.
