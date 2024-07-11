import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { app } from "electron";

let db: any;

export async function initializeDatabase() {
  const dbPath = app.isPackaged
    ? path.join(process.resourcesPath, "scrapeData.db")
    : path.join(app.getPath("userData"), "scrapeData.db");

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  console.log("initializeDatabase", dbPath);

  await db.run(`
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
