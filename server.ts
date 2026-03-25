import "dotenv/config";
import express from "express";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import db from "./db";
import { analyzeSentiment, generateSummary } from "./sentiment";

const JWT_SECRET = process.env.JWT_SECRET || "feedbackhub-secret-key-2026";
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";

async function createServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Auth Middleware
  const authenticateAdmin = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.admin = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };

  // API Routes
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });
      return res.json({ token });
    }
    res.status(401).json({ error: "Invalid credentials" });
  });

  app.post("/api/feedback", (req, res) => {
    const { name, email, product, category, message } = req.body;
    if (!name || !product || !category || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { sentiment, score, isUrgent } = analyzeSentiment(message);

    const stmt = db.prepare(`
      INSERT INTO feedback (name, email, product, category, message, sentiment, sentiment_score, is_urgent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(name, email, product, category, message, sentiment, score, isUrgent ? 1 : 0);
    
    res.json({
      id: info.lastInsertRowid,
      name,
      sentiment,
      is_urgent: isUrgent
    });
  });

  app.get("/api/feedback", (req, res) => {
    const { category, sentiment, search, limit = 50, offset = 0 } = req.query;
    let query = "SELECT * FROM feedback WHERE 1=1";
    const params: any[] = [];

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }
    if (sentiment) {
      query += " AND sentiment = ?";
      params.push(sentiment);
    }
    if (search) {
      query += " AND (product LIKE ? OR message LIKE ? OR name LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));
    
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  });

  app.get("/api/summary", (req, res) => {
    const recent = db.prepare("SELECT message, sentiment, is_urgent FROM feedback ORDER BY created_at DESC LIMIT 100").all();
    const summary = generateSummary(recent);
    res.json({ summary });
  });

  app.get("/api/stats", (req, res) => {
    const total = db.prepare("SELECT COUNT(*) as count FROM feedback").get() as any;
    const byCategory = db.prepare("SELECT category, COUNT(*) as count FROM feedback GROUP BY category").all() as any[];
    const bySentiment = db.prepare("SELECT sentiment, COUNT(*) as count FROM feedback GROUP BY sentiment").all() as any[];
    
    res.json({
      total: total.count,
      by_category: byCategory.reduce((acc, curr) => ({ ...acc, [curr.category]: curr.count }), {}),
      by_sentiment: bySentiment.reduce((acc, curr) => ({ ...acc, [curr.sentiment]: curr.count }), {})
    });
  });

  app.delete("/api/admin/feedback/:id", authenticateAdmin, (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM feedback WHERE id = ?").run(id);
    res.json({ message: "Deleted" });
  });

  app.get("/api/export/json", authenticateAdmin, (req, res) => {
    const rows = db.prepare("SELECT * FROM feedback ORDER BY created_at DESC").all();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=feedback_export.json');
    res.send(JSON.stringify(rows, null, 2));
  });

  app.get("/api/export/csv", authenticateAdmin, (req, res) => {
    const rows = db.prepare("SELECT * FROM feedback ORDER BY created_at DESC").all() as any[];
    if (rows.length === 0) return res.send("");
    
    const headers = Object.keys(rows[0]).join(",");
    const csv = [headers, ...rows.map(row => Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=feedback_export.csv');
    res.send(csv);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Ensure SPA fallback for all non-API routes in dev
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) return next();
      try {
        const fs = await import('fs');
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
  
  return app;
}

const appPromise = createServer();

// Export for Vercel
export default async (req: any, res: any) => {
  const app = await appPromise;
  return app(req, res);
};
