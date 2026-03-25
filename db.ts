import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'feedback.db'));

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
