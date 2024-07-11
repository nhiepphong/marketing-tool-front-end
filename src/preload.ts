const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  facebookGetUIDFromProfile: (url: string, cookies: string) =>
    ipcRenderer.invoke("facebook-get-uid-from-profile", url, cookies),
  facebookGetUIDFromLinkArticle: (
    url: string,
    cookies: string,
    interactions: any
  ) =>
    ipcRenderer.invoke(
      "facebook-get-uid-from-article",
      url,
      cookies,
      interactions
    ),
  onUpdateDataGetUIDArticle: (callback: any) =>
    ipcRenderer.on("update-data-get-uid-article", callback),
  onUpdateStatusToView: (callback: any) =>
    ipcRenderer.on("update-alert-to-view", callback),
  getPhoneNumber: (uid: string) => ipcRenderer.invoke("get-phone-number", uid),
  stopRunTask: () => ipcRenderer.invoke("stop-run-task"),
  readCookieFile: () => ipcRenderer.invoke("read-cookie-file"),
  saveCookieFile: (cookie: string) =>
    ipcRenderer.invoke("save-cookie-file", cookie),
  clearDataFromDB: () => ipcRenderer.invoke("clear-all-data"),
  addDataFromDB: (item: any) => ipcRenderer.invoke("db-add-data", item),
  getTotalCountItem: () => ipcRenderer.invoke("db-get-total-count"),
  getDataForPagination: (currentPage: number, itemsPerPage: number) =>
    ipcRenderer.invoke("db-get-data-by-page", currentPage, itemsPerPage),
});

console.log("preload");
export {};
