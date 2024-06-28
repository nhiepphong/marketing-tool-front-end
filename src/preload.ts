const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  facebookGetUIDFromProfile: (url: string, cookies: string) =>
    ipcRenderer.invoke("facebook-get-uid-from-profile", url, cookies),
  facebookGetUIDFromLinkArticle: (url: string, cookies: string) =>
    ipcRenderer.invoke("facebook-get-uid-from-article", url, cookies),
  onUpdateDataGetUIDArticle: (callback: any) =>
    ipcRenderer.on("update-data-get-uid-article", callback),
  getPhoneNumber: (uid: string) => ipcRenderer.invoke("get-phone-number", uid),
  readCookieFile: () => ipcRenderer.invoke("read-cookie-file"),
  saveCookieFile: (cookie: string) =>
    ipcRenderer.invoke("save-cookie-file", cookie),
});

export {};
