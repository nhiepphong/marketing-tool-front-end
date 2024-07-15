// excelExport.ts
import ExcelJS from "exceljs";
import { getDataInBatches, ScrapedItem, getTotalCount } from "./dbOperations";
import { BrowserWindow, dialog } from "electron";
import fs from "fs";

export async function exportToExcel(
  mainWindow: BrowserWindow,
  progressCallback: (progress: number) => void
): Promise<string | null> {
  const totalRows = await getTotalCount();
  if (totalRows === 0) {
    throw new Error("No data to export");
  }

  const saveDialog = await dialog.showSaveDialog(mainWindow, {
    title: "Export Excel File",
    defaultPath: `scraped_data_${Date.now()}.xlsx`,
    filters: [{ name: "Excel Files", extensions: ["xlsx"] }],
  });

  if (saveDialog.canceled || !saveDialog.filePath) {
    return null;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Scraped Data");

  worksheet.columns = [
    { header: "ID", key: "id", width: 10 },
    { header: "Name", key: "name", width: 30 },
    { header: "UID", key: "uid", width: 20 },
    { header: "Gender", key: "gender", width: 10 },
    { header: "Link", key: "link", width: 50 },
    { header: "Phone", key: "phone", width: 15 },
    { header: "Type", key: "type", width: 15 },
    { header: "Message", key: "message", width: 50 },
  ];

  const batchSize = 1000;
  const batchIterator = await getDataInBatches(batchSize);
  let processedRows = 0;

  for await (const batch of batchIterator) {
    worksheet.addRows(batch);
    processedRows += batch.length;
    const progress = (processedRows / totalRows) * 100;
    progressCallback(progress);
  }

  await workbook.xlsx.writeFile(saveDialog.filePath);

  return saveDialog.filePath;
}
