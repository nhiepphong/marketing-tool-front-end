import { GroupItem } from "./utils/interface.global";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  facebookGetUIDFromProfile: (url: string, cookies: string) =>
    ipcRenderer.invoke("facebook-get-uid-from-profile", url, cookies),
  facebookGetUIDFromLinkArticle: (
    group_id: number,
    url: string,
    cookies: string,
    interactions: any
  ) =>
    ipcRenderer.invoke(
      "facebook-get-uid-from-article",
      group_id,
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
  getTotalCountItem: (group_id: number) =>
    ipcRenderer.invoke("db-get-total-count", group_id),
  getDataForPagination: (
    group_id: number,
    currentPage: number,
    itemsPerPage: number
  ) =>
    ipcRenderer.invoke(
      "db-get-data-by-page",
      group_id,
      currentPage,
      itemsPerPage
    ),
  newGroupFromDB: (item: any) => ipcRenderer.invoke("db-new-group", item),
  getAllGroup: () => ipcRenderer.invoke("db-get-all-group"),
  showLog: (callback: any) => ipcRenderer.on("log-pupp", callback),
  onUpdateProgressExxport: (callback: any) =>
    ipcRenderer.on("update-export-progress-excel", callback),
  exportToExcel: (group_id: number) =>
    ipcRenderer.invoke("export-excel", group_id),
});
console.log("preload");
export {};
