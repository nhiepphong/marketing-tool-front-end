import { app, BrowserWindow, ipcMain, protocol, session } from "electron";
import path from "path";
import {
  facebookGetUIDFromLinkArticle,
  facebookGetUIDFromProfile,
} from "./controllers/puppeteer";
import fs from "fs";
import { promisify } from "util";

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

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

  // session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  //   callback({
  //     responseHeaders: {
  //       ...details.responseHeaders,
  //       "Content-Security-Policy": [
  //         "default-src 'self'; " +
  //           "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
  //           "style-src 'self' 'unsafe-inline'; " +
  //           "connect-src 'self' http://192.168.1.16:8000; " + // Thêm địa chỉ IP và cổng cụ thể vào đây
  //           "img-src 'self' data: https:;",
  //       ],
  //     },
  //   });
  // });

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
