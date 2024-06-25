import { app, BrowserWindow, ipcMain, protocol, session } from "electron";
import path from "path";
import { scrapeFacebook } from "./controllers/puppeteer";
import fs from "fs";

const isDev = true;
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
      preload: path.join(__dirname, "preload.js"),
    },
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;",
        ],
      },
    });
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(app.getAppPath(), "build", "index.html");
    console.log("Loading index.html from:", indexPath);

    mainWindow.loadFile(indexPath);

    // Xử lý các yêu cầu file
    mainWindow.webContents.session.protocol.interceptFileProtocol(
      "file",
      (request, callback) => {
        const url = request.url.substr(7); // Loại bỏ "file://"
        const normalizedPath = path.normalize(`${__dirname}/${url}`);

        if (fs.existsSync(normalizedPath)) {
          callback({ path: normalizedPath });
        } else {
          // Nếu file không tồn tại, trả về index.html
          callback({ path: indexPath });
        }
      }
    );

    // Mở DevTools trong production để debug
    mainWindow.webContents.openDevTools();
  }
}

app.on("ready", () => {
  protocol.registerFileProtocol("file", (request, callback) => {
    const url = request.url.substr(7); // remove "file://"
    callback({ path: path.normalize(`${__dirname}/${url}`) });
  });

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
  "scrape-facebook",
  async (
    event,
    url: string,
    cookies: string,
    searchType: string,
    interactions: number
  ) => {
    try {
      const result = await scrapeFacebook(
        url,
        cookies,
        searchType,
        interactions
      );
      return result;
    } catch (error) {
      console.error("Error in scrapeFacebook:", error);
      throw error;
    }
  }
);
