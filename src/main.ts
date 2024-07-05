import { app, BrowserWindow, ipcMain, protocol, session } from "electron";
import path from "path";
import {
  facebookGetUIDFromLinkArticle,
  facebookGetUIDFromProfile,
} from "./controllers/puppeteer";
import fs from "fs";
import { promisify } from "util";
import * as url from "url";
import log from "electron-log";
import { readFile } from "fs/promises";
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

log.transports.file.level = "info";
log.info("Application starting...");

const isDev = !app.isPackaged;
//const isDev = true;
console.log("isDev (using app.isPackaged):", isDev);
console.log("process.env.NODE_ENV:", process.env.NODE_ENV);

// Sử dụng import động
// import("electron-is-dev")
//   .then((isDevModule) => {
//     isDev = isDevModule.default;
//   })
//   .catch((err) => {
//     console.error("Failed to import electron-is-dev:", err);
//   });

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

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "build", "index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
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
      const result = await facebookGetUIDFromLinkArticle(
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
