import fs from "fs";
import path from "path";
import { createRequire } from "module";

type FeedbackRow = {
  id: number;
  name: string;
  email: string | null;
  product: string;
  category: string;
  message: string;
  sentiment: string;
  sentiment_score: number;
  is_urgent: number;
  created_at: string;
  updated_at: string;
};

type Statement = {
  run: (...params: any[]) => any;
  all: (...params: any[]) => any[];
  get: (...params: any[]) => any;
};

type DbLike = {
  exec: (sql: string) => void;
  prepare: (sql: string) => Statement;
};

const require = createRequire(import.meta.url);

function resolveDatabasePath() {
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }

  if (process.env.VERCEL) {
    return path.join("/tmp", "feedback.json");
  }

  return path.join(process.cwd(), "feedback.db");
}

function normalizeSql(sql: string) {
  return sql.replace(/\s+/g, " ").trim();
}

function createJsonDb(filePath: string): DbLike {
  const ensureStore = () => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({ lastId: 0, feedback: [] }, null, 2));
    }
  };

  const readStore = (): { lastId: number; feedback: FeedbackRow[] } => {
    ensureStore();
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  };

  const writeStore = (store: { lastId: number; feedback: FeedbackRow[] }) => {
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
  };

  return {
    exec() {},
    prepare(sql: string): Statement {
      const query = normalizeSql(sql);

      return {
        run: (...params: any[]) => {
          const store = readStore();

          if (query.startsWith("INSERT INTO feedback")) {
            const [name, email, product, category, message, sentiment, score, isUrgent] = params;
            const id = store.lastId + 1;
            const timestamp = new Date().toISOString();

            const row: FeedbackRow = {
              id,
              name,
              email: email || null,
              product,
              category,
              message,
              sentiment,
              sentiment_score: Number(score) || 0,
              is_urgent: Number(isUrgent) || 0,
              created_at: timestamp,
              updated_at: timestamp,
            };

            store.lastId = id;
            store.feedback.push(row);
            writeStore(store);

            return { lastInsertRowid: id };
          }

          if (query === "DELETE FROM feedback WHERE id = ?") {
            const id = Number(params[0]);
            const next = store.feedback.filter((item) => item.id !== id);
            const changes = store.feedback.length - next.length;
            store.feedback = next;
            writeStore(store);
            return { changes };
          }

          throw new Error(`Unsupported run query: ${query}`);
        },

        all: (...params: any[]) => {
          const store = readStore();
          const feedback = [...store.feedback].sort((a, b) => b.created_at.localeCompare(a.created_at));

          if (query.startsWith("SELECT * FROM feedback WHERE 1=1")) {
            let cursor = 0;
            let rows = feedback;

            if (query.includes("AND category = ?")) {
              const category = String(params[cursor++]);
              rows = rows.filter((item) => item.category === category);
            }

            if (query.includes("AND sentiment = ?")) {
              const sentiment = String(params[cursor++]);
              rows = rows.filter((item) => item.sentiment === sentiment);
            }

            if (query.includes("AND (product LIKE ? OR message LIKE ? OR name LIKE ?)")) {
              const rawSearch = String(params[cursor++] || "");
              cursor += 2;
              const search = rawSearch.replace(/^%|%$/g, "").toLowerCase();
              rows = rows.filter((item) =>
                item.product.toLowerCase().includes(search) ||
                item.message.toLowerCase().includes(search) ||
                item.name.toLowerCase().includes(search)
              );
            }

            const limit = Number(params[cursor++]) || 50;
            const offset = Number(params[cursor++]) || 0;
            return rows.slice(offset, offset + limit);
          }

          if (query === "SELECT message, sentiment, is_urgent FROM feedback ORDER BY created_at DESC LIMIT 100") {
            return feedback.slice(0, 100).map((item) => ({
              message: item.message,
              sentiment: item.sentiment,
              is_urgent: item.is_urgent,
            }));
          }

          if (query === "SELECT category, COUNT(*) as count FROM feedback GROUP BY category") {
            const counts = new Map<string, number>();
            for (const item of feedback) {
              counts.set(item.category, (counts.get(item.category) || 0) + 1);
            }
            return Array.from(counts.entries()).map(([category, count]) => ({ category, count }));
          }

          if (query === "SELECT sentiment, COUNT(*) as count FROM feedback GROUP BY sentiment") {
            const counts = new Map<string, number>();
            for (const item of feedback) {
              counts.set(item.sentiment, (counts.get(item.sentiment) || 0) + 1);
            }
            return Array.from(counts.entries()).map(([sentiment, count]) => ({ sentiment, count }));
          }

          if (query === "SELECT * FROM feedback ORDER BY created_at DESC") {
            return feedback;
          }

          throw new Error(`Unsupported all query: ${query}`);
        },

        get: () => {
          const store = readStore();

          if (query === "SELECT COUNT(*) as count FROM feedback") {
            return { count: store.feedback.length };
          }

          throw new Error(`Unsupported get query: ${query}`);
        },
      };
    },
  };
}

function createSqliteDb(filePath: string): DbLike {
  const Database = require("better-sqlite3");
  return new Database(filePath);
}

const db = process.env.VERCEL
  ? createJsonDb(resolveDatabasePath())
  : createSqliteDb(resolveDatabasePath());

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
