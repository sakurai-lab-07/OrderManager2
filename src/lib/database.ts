import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

// テーブルが存在しない場合は作成
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 注文番号のシーケンスを管理するテーブル
db.exec(`
  CREATE TABLE IF NOT EXISTS order_sequence (
    id INTEGER PRIMARY KEY,
    current_number INTEGER NOT NULL DEFAULT 0
  )
`);

// 初期データがない場合は挿入
const sequenceCount = db
  .prepare("SELECT COUNT(*) as count FROM order_sequence")
  .get() as { count: number };
if (sequenceCount.count === 0) {
  db.prepare(
    "INSERT INTO order_sequence (id, current_number) VALUES (1, 0)"
  ).run();
}

export default db;
