import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";

let db: Database.Database;

export function initializeDatabase() {
  const dbPath = app.isPackaged
    ? path.join(process.resourcesPath, "scrapeData.db")
    : path.join(app.getPath("userData"), "scrapeData.db");

  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS scraped_data (
      id INTEGER PRIMARY KEY,
      name TEXT,
      uid TEXT UNIQUE,
      gender TEXT,
      link TEXT,
      phone TEXT,
      type TEXT,
      message TEXT
    )
  `);

  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error("Database has not been initialized");
  }
  return db;
}
