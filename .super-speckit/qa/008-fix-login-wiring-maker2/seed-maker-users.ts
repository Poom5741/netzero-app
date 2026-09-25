// Seed runtime users into the maker worktree's fresh local D1 (bun:sqlite).
// Uses the repo's own hashPassword (PBKDF2) per plan.md credentials.
import { Database } from "bun:sqlite";
import { hashPassword, verifyPassword } from "./src/auth/password.ts";

const dbPath = process.argv[2];
if (!dbPath) throw new Error("usage: bun seed-maker-users.ts <sqlite-path>");
const pw = "ClawTest2026!";
const hash = await hashPassword(pw);
if (!(await verifyPassword(pw, hash))) throw new Error("self-test failed");

const db = new Database(dbPath);
db.query(
  "INSERT OR REPLACE INTO users (id, email, password_hash, role, name) VALUES (?, ?, ?, ?, ?)",
).run("qa_admin_008", "admin@netzero.local", hash, "admin", "QA Admin");
db.query(
  "INSERT OR REPLACE INTO users (id, email, password_hash, role, name) VALUES (?, ?, ?, ?, ?)",
).run("qa_sponsor_008", "sponsor@netzero.local", hash, "sponsor", "QA Sponsor");
const rows = db.query("SELECT email, role FROM users").all();
console.log("seeded:", JSON.stringify(rows));
db.close();
