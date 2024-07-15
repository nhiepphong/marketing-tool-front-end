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

export async function addData(item: ScrapedItem): Promise<number> {
  const db = getDatabase();
  console.log("addData Begin:", item);
  const result = await db.run(
    `
    INSERT OR REPLACE INTO scraped_data 
    (id, name, uid, gender, link, phone, type, message) 
    VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      item.name,
      item.uid,
      item.gender,
      item.link,
      item.phone,
      item.type,
      item.message,
    ]
  );
  console.log("addData End:", item);
  return result.changes;
}

export async function findByLink(link: string): Promise<ScrapedItem | null> {
  const db = getDatabase();
  return await db.get("SELECT * FROM scraped_data WHERE link = ?", [link]);
}

export async function getDataByPage(
  page: number,
  itemsPerPage: number
): Promise<ScrapedItem[]> {
  const db = getDatabase();
  return await db.all("SELECT * FROM scraped_data LIMIT ? OFFSET ?", [
    itemsPerPage,
    (page - 1) * itemsPerPage,
  ]);
}

export async function getTotalCount(): Promise<number> {
  const db = getDatabase();
  const result = await db.get("SELECT COUNT(*) as count FROM scraped_data");
  console.log("getTotalCount", result, result.count);
  return result.count;
}
export function clearAllData(): void {
  const db = getDatabase();
  db.run("DELETE FROM scraped_data");
}

export async function getDataInBatches(
  batchSize: number
): Promise<AsyncIterableIterator<ScrapedItem[]>> {
  const db = getDatabase();
  let offset = 0;

  async function* generate() {
    while (true) {
      const batch = await db.all(
        "SELECT * FROM scraped_data LIMIT ? OFFSET ?",
        [batchSize, offset]
      );
      if (batch.length === 0) break;
      yield batch;
      offset += batchSize;
    }
  }

  return generate();
}
