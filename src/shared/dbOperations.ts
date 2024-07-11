import { getDatabase } from "./database";

export interface ScrapedItem {
  id: number;
  name: string;
  uid: string;
  gender: string;
  link: string;
  phone: string | null;
  type: string;
  message: string;
}

export function addData(item: ScrapedItem): number {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO scraped_data 
    (id, name, uid, gender, link, phone, type, message) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    item.id,
    item.name,
    item.uid,
    item.gender,
    item.link,
    item.phone,
    item.type,
    item.message
  );
  return info.changes;
}

export function findByLink(link: string): ScrapedItem | null {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM scraped_data WHERE link = ?");
  return stmt.get(link) as ScrapedItem | null;
}

export function getDataByPage(
  page: number,
  itemsPerPage: number
): ScrapedItem[] {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM scraped_data LIMIT ? OFFSET ?");
  return stmt.all(itemsPerPage, (page - 1) * itemsPerPage) as ScrapedItem[];
}

export function getTotalCount(): number {
  const db = getDatabase();
  const stmt = db.prepare("SELECT COUNT(*) as count FROM scraped_data");
  const result = stmt.get() as { count: number };
  return result.count;
}
export function clearAllData(): void {
  const db = getDatabase();
  const stmt = db.prepare("DELETE FROM scraped_data");
  stmt.run();
}
export function searchByName(name: string): ScrapedItem[] {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM scraped_data WHERE name LIKE ?");
  return stmt.all(`%${name}%`) as ScrapedItem[];
}

export function filterByGender(gender: string): ScrapedItem[] {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM scraped_data WHERE gender = ?");
  return stmt.all(gender) as ScrapedItem[];
}

export function getDataByType(type: string): ScrapedItem[] {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM scraped_data WHERE type = ?");
  return stmt.all(type) as ScrapedItem[];
}
