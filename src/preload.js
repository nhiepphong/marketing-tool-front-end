const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  scrapeFacebook: (url, cookies, searchType, interactions) =>
    ipcRenderer.invoke(
      "scrape-facebook",
      url,
      cookies,
      searchType,
      interactions
    ),
  getPhoneNumber: (uid) => ipcRenderer.invoke("get-phone-number", uid),
  getCurrentWindow: () => BrowserWindow.getFocusedWindow(),
});
