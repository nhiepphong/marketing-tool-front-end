import { app, BrowserWindow, ipcMain, protocol, session } from "electron";
import path from "path";
import {
  facebookGetUIDFromLinkArticle,
  facebookGetUIDFromProfile,
  onSendMessageToUser,
} from "./controllers/puppeteer";
import fs from "fs";
import { promisify } from "util";
import log from "electron-log";
import { initializeDatabase } from "./shared/database";
import * as dbOps from "./shared/dbOperations";
import { exportToExcel } from "./shared/excelExport";
import { GroupItem } from "./utils/interface.global";

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

log.transports.file.level = "info";
log.info("Application starting...");

const isDev = !app.isPackaged;
//const isDev = false;

let isScrapingStopped = false;

let mainWindow: BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 760,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.setMenu(null);

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "build", "index.html"));
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    log.info("Memory usage:", memoryUsage);
  }, 60000); // Ghi log mỗi phút
}

app.whenReady().then(() => {
  createWindow();
  initializeDatabase();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.handle(
  "facebook-get-uid-from-profile",
  async (event, url: string, cookies: string) => {
    try {
      isScrapingStopped = false;
      const result = await facebookGetUIDFromProfile(url, cookies, mainWindow);
      console.log("facebook-get-uid-from-profile result:", result);
      return result;
    } catch (error) {
      console.error("Error in facebookGetUIDFromProfile:", error);
      throw error;
    }
  }
);

ipcMain.handle(
  "facebook-get-uid-from-article",
  async (
    event,
    group_id: number,
    url: string,
    cookies: string,
    interactions: any
  ) => {
    try {
      isScrapingStopped = false;
      const result = await facebookGetUIDFromLinkArticle(
        {
          isStopRequested: () => isScrapingStopped,
        },
        mainWindow,
        group_id,
        url,
        cookies,
        interactions
      );
      console.log("facebook-get-uid-from-article:", result);
      return result;
    } catch (error) {
      console.error("Error in facebookGetUIDFromLinkArticle:", error);
      throw error;
    }
  }
);

const cookieFilePath = path.join(
  app.getPath("userData"),
  "facebook_cookie.txt"
);

ipcMain.handle("read-cookie-file", async () => {
  try {
    console.log("Reading cookie file from:", cookieFilePath);
    const cookie = await readFileAsync(cookieFilePath, "utf-8");
    return cookie;
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      // File không tồn tại, trả về chuỗi rỗng
      return "";
    }
    throw error;
  }
});

ipcMain.handle("save-cookie-file", async (event, cookie: string) => {
  await writeFileAsync(cookieFilePath, cookie, "utf-8");
});

ipcMain.handle("stop-run-task", async (event) => {
  console.log("isScrapingStopped 1:", isScrapingStopped);
  isScrapingStopped = true;
  console.log("isScrapingStopped 2:", isScrapingStopped);
});

// IPC handlers
ipcMain.handle("db-add-data", async (event, item) => {
  return await dbOps.addData(item);
});

ipcMain.handle("db-find-by-uid", async (event, link) => {
  return await dbOps.findByLink(link);
});

ipcMain.handle(
  "db-get-data-by-page",
  async (event, group_id, page, itemsPerPage) => {
    return await dbOps.getDataByPage(group_id, page, itemsPerPage);
  }
);

ipcMain.handle("db-get-total-count", async (event, group_id) => {
  return await dbOps.getTotalCount(group_id);
});

ipcMain.handle("db-update-all-is-send-data", async (event, is_send) => {
  return await dbOps.updateAllIsSend(is_send);
});

ipcMain.handle("clear-all-data", async () => {
  return await dbOps.clearAllData();
});

ipcMain.handle("db-new-group", async (event, item: GroupItem) => {
  try {
    const tmp = await dbOps.newGroup(item);
    console.log("db-new-group", tmp);
    return tmp;
  } catch (error) {
    return null;
  }
});

ipcMain.handle("db-get-all-group", async () => {
  try {
    const tmp = await dbOps.getAllGroup();
    return tmp;
  } catch (error) {
    return null;
  }
});

ipcMain.handle("db-update-count-data-group", async (event, count_data) => {
  return await dbOps.updateCountDataForGroup(count_data);
});

ipcMain.handle("export-excel", async (event, group_id) => {
  if (mainWindow) {
    try {
      const filePath = await exportToExcel(group_id, mainWindow, (progress) => {
        event.sender.send("update-export-progress-excel", progress);
      });
      return { success: true, filePath };
    } catch (error: any) {
      console.error("Error exporting to Excel:", error);
      return { success: false, error: error.message };
    }
  }
});

ipcMain.handle(
  "send-chat-to-user",
  async (event, cookies, dataSend, group_id) => {
    try {
      isScrapingStopped = false;
      const result = await onSendMessageToUser(
        mainWindow,
        cookies,
        dataSend,
        group_id
      );
      console.log("send-chat-to-user result:", result);
      return result;
    } catch (error) {
      console.error("Error in send-chat-to-user:", error);
      throw error;
    }
  }
);
