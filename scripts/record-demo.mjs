import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { chromium } from "playwright";

const scriptFile = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(scriptFile), "..");
const docsDir = path.join(rootDir, "docs");
const outputVideo = path.join(docsDir, "feedbackhub-demo.webm");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const baseUrl = "http://127.0.0.1:3000";
const adminUser = process.env.ADMIN_USER || "admin";
const adminPass = process.env.ADMIN_PASS || "admin123";

fs.mkdirSync(docsDir, { recursive: true });
for (const entry of fs.readdirSync(docsDir)) {
  if (entry.endsWith(".webm")) {
    fs.unlinkSync(path.join(docsDir, entry));
  }
}

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
});

const context = await browser.newContext({
  acceptDownloads: true,
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: docsDir, size: { width: 1440, height: 900 } },
});

const page = await context.newPage();

async function pause(ms) {
  await page.waitForTimeout(ms);
}

async function seedFeedback(entry) {
  const response = await fetch(`${baseUrl}/api/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });

  if (!response.ok) {
    throw new Error(`Failed to seed feedback: ${response.status} ${response.statusText}`);
  }
}

async function getAdminToken() {
  const response = await fetch(`${baseUrl}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: adminUser,
      password: adminPass,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to log in as admin: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.token;
}

await seedFeedback({
  name: "Alex Carter",
  email: "alex@example.com",
  product: "Mobile App",
  category: "feature request",
  message: "The new dashboard looks promising. Please add dark mode and quicker export options for team reports.",
});

await seedFeedback({
  name: "Priya Nair",
  email: "priya@example.com",
  product: "Support Portal",
  category: "complaint",
  message: "The latest update feels slow and confusing during checkout, and customers are getting frustrated with the extra steps.",
});

await page.goto(baseUrl, { waitUntil: "networkidle" });
await pause(1200);

await page.getByPlaceholder("John Doe").fill("Jordan Lee");
await page.getByPlaceholder("john@example.com").fill("jordan@example.com");
await page.getByPlaceholder("e.g. Mobile App").fill("Customer Portal");
await page.locator("select").first().selectOption("bug");
await page.getByPlaceholder("Tell us what's on your mind...").fill("Search results are loading slowly, and the filter state is getting reset unexpectedly.");
await pause(1800);

await page.goto(`${baseUrl}/dashboard`, { waitUntil: "networkidle" });
await pause(2500);

await page.locator("text=Category Distribution").scrollIntoViewIfNeeded();
await pause(1500);

await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
await pause(1600);

const adminToken = await getAdminToken();
await page.evaluate((token) => {
  localStorage.setItem("admin_token", token);
}, adminToken);

await page.goto(`${baseUrl}/admin`, { waitUntil: "networkidle" });
await pause(2500);

await page.getByPlaceholder("Search by name, product or message...").fill("Portal");
await page.keyboard.press("Enter");
await pause(1800);

await page.getByRole("button", { name: "CSV" }).click();
await pause(1200);

const video = page.video();
await context.close();
await browser.close();

const recordedPath = await video.path();
fs.renameSync(recordedPath, outputVideo);

console.log(`Demo video saved to ${outputVideo}`);
