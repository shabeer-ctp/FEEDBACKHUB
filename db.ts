import Database from 'better-sqlite3';
import path from 'path';

function resolveDatabasePath() {
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }

  // Vercel serverless functions cannot write into the project directory.
  // Use the temp directory there so SQLite can still initialize.
  if (process.env.VERCEL) {
    return path.join('/tmp', 'feedback.db');
  }

  return path.join(process.cwd(), 'feedback.db');
}

const db = new Database(resolveDatabasePath());

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    product TEXT NOT NULL,
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    sentiment TEXT NOT NULL,
    sentiment_score INTEGER DEFAULT 0,
    is_urgent INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
