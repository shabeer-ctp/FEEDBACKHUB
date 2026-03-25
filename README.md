# FeedbackHub

FeedbackHub is a full-stack customer feedback management platform. It lets users submit feedback and gives admins a clean dashboard to review trends, sentiment, and exports.

## Demo

Watch the demo video here: [feedbackhub-demo.webm](./docs/feedbackhub-demo.webm)

## Features

- Public feedback submission form with category selection
- Sentiment scoring and urgent-issue detection
- Summary insights from recent feedback
- Analytics dashboard with charts
- Admin portal with search, filters, and delete actions
- CSV and JSON export options
- Responsive interface for desktop and mobile

## Local Development

### Prerequisites

- Node.js 18 or higher
- npm

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file in the project root if you want custom values:

```env
JWT_SECRET=your_secret_key_here
ADMIN_USER=admin
ADMIN_PASS=admin123
```

### Run the App

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## Deployment

### Vercel Notes

This project currently uses SQLite through `feedback.db`.

- On Vercel, the file system is ephemeral, so local SQLite data will not persist reliably.
- For production use, replace the SQLite setup in `db.ts` with a hosted database such as Supabase Postgres or Vercel Postgres.
- Configure `JWT_SECRET`, `ADMIN_USER`, and `ADMIN_PASS` in your deployment environment.

### Deployment Steps

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Use `npm run build` as the build command.
4. Use `dist` as the output directory.
5. Add the required environment variables and deploy.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Recharts, Lucide React, Motion
- Backend: Node.js, Express, JWT, BcryptJS
- Database: SQLite with `better-sqlite3`
- Analysis: Custom sentiment and summary logic

## License

MIT License. Built by Shabeer.
