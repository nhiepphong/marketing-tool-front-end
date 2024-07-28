import { GroupItem, ScrapedItem } from "../utils/interface.global";
import { getDatabase } from "./database";

export async function addData(item: ScrapedItem): Promise<number> {
  const db = getDatabase();
  console.log("addData Begin:", item);
  const result = await db.run(
    `
    INSERT OR REPLACE INTO scraped_data 
    (name, uid, gender, link, phone, type, message, group_id, is_send) 
    VALUES (?, ?, ?, ?, ?, ?, ?,?,0)
  `,
    [
      item.name,
      item.uid,
      item.gender,
      item.link,
      item.phone,
      item.type,
      item.message,
      item.group_id,
    ]
  );
  console.log("addData End:", item);
  return result.changes;
}

export async function findByLink(link: string): Promise<ScrapedItem | null> {
  const db = getDatabase();
  return await db.get("SELECT * FROM scraped_data WHERE link = ?", [link]);
}

export async function findByLinkAndGroupID(
  link: string,
  group_id: number
): Promise<ScrapedItem | null> {
  const db = getDatabase();
  return await db.get(
    "SELECT * FROM scraped_data WHERE link = ? AND group_id = ?",
    [link, group_id]
  );
}

export async function getDataNotSendInGroup(
  group_id: number
): Promise<ScrapedItem | null> {
  const db = getDatabase();
  return await db.get(
    "SELECT * FROM scraped_data WHERE is_send = 0 AND group_id = ?",
    [group_id]
  );
}

export async function updateIsSend(
  id: number,
  isSend: number
): Promise<number> {
  const db = getDatabase();

  const result = await db.run(
    `UPDATE scraped_data SET is_send = ? WHERE id = ?`,
    [isSend, id]
  );
  console.log("updateIsSend", id, isSend, result);
  return result.changes;
}

export async function updateAllIsSend(isSend: number): Promise<number> {
  const db = getDatabase();

  const result = await db.run(`UPDATE scraped_data SET is_send = ?`, [isSend]);
  return result.changes;
}

export async function getDataByPage(
  group_id: number,
  page: number,
  itemsPerPage: number
): Promise<ScrapedItem[]> {
  const db = getDatabase();
  if (group_id > 0) {
    return await db.all(
      "SELECT * FROM scraped_data WHERE group_id = ? LIMIT ? OFFSET ?",
      [group_id, itemsPerPage, (page - 1) * itemsPerPage]
    );
  } else {
    return [];
    return await db.all("SELECT * FROM scraped_data LIMIT ? OFFSET ?", [
      itemsPerPage,
      (page - 1) * itemsPerPage,
    ]);
  }
}

export async function getTotalCount(group_id: number): Promise<number> {
  const db = getDatabase();
  if (group_id == 0) {
    return 0;
    const result = await db.get("SELECT COUNT(*) as count FROM scraped_data");
    console.log("getTotalCount", result.count);
    return result.count;
  } else {
    const result = await db.get(
      "SELECT COUNT(*) as count FROM scraped_data WHERE group_id =?",
      [group_id]
    );
    console.log("getTotalCount", result.count);
    return result.count;
  }
}
export function clearAllData(): void {
  const db = getDatabase();
  db.run(`DELETE FROM scraped_data`, (err: any) => {
    db.run(`VACUUM`, (err: any) => {});
  });
  db.run(`DELETE FROM group_data`, (err: any) => {
    db.run(`VACUUM`, (err: any) => {});
  });
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

export async function newGroup(item: GroupItem): Promise<GroupItem | null> {
  const db = getDatabase();
  const result = await db.run(
    `
    INSERT OR REPLACE INTO group_data 
    (name, date, link, status, count_data) 
    VALUES (?, ?, ?, ?, 0)
  `,
    [item.name, item.date, item.link, item.status]
  );
  const group = await getGroupByID(result.lastID);
  console.log("newGroup:", group);
  return group;
}
export async function getGroupByID(id: number): Promise<GroupItem | null> {
  const db = getDatabase();
  return await db.get("SELECT * FROM group_data WHERE id = ?", [id]);
}

export async function getAllGroup(): Promise<GroupItem | null> {
  const db = getDatabase();
  return await db.all("SELECT * FROM group_data");
}

export async function updateCountDataForGroup(
  count_data: number
): Promise<number> {
  const db = getDatabase();

  const result = await db.run(`UPDATE group_data SET count_data = ?`, [
    count_data,
  ]);
  return result.changes;
}
