import { app, BrowserWindow, ipcMain, protocol, session } from "electron";
import path from "path";
import {
  facebookGetUIDFromLinkArticle,
  facebookGetUIDFromProfile,
} from "./controllers/puppeteer";
import fs from "fs";
import { promisify } from "util";
import log from "electron-log";
import { initializeDatabase } from "./shared/database";
import * as dbOps from "./shared/dbOperations";

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

log.transports.file.level = "info";
log.info("Application starting...");

//const isDev = !app.isPackaged;
const isDev = false;

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
    //mainWindow.webContents.openDevTools();
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
      const result = await facebookGetUIDFromProfile(url, cookies);
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
  async (event, url: string, cookies: string, interactions: any) => {
    try {
      isScrapingStopped = false;
      const result = await facebookGetUIDFromLinkArticle(
        {
          isStopRequested: () => isScrapingStopped,
        },
        mainWindow,
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
ipcMain.handle("db-add-data", (event, item) => {
  return dbOps.addData(item);
});

ipcMain.handle("db-find-by-uid", (event, link) => {
  return dbOps.findByLink(link);
});

ipcMain.handle("db-get-data-by-page", (event, page, itemsPerPage) => {
  return dbOps.getDataByPage(page, itemsPerPage);
});

ipcMain.handle("db-get-total-count", () => {
  return dbOps.getTotalCount();
});
ipcMain.handle("clear-all-data", () => {
  return dbOps.clearAllData();
});
