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
  updateIsSendAllDataFromDB: (is_send: number) =>
    ipcRenderer.invoke("db-update-all-is-send-data", is_send),
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
  updateCountDataForGroupFromDB: (count_data: number) =>
    ipcRenderer.invoke("db-update-count-data-group", count_data),
  showLog: (callback: any) => ipcRenderer.on("log-pupp", callback),
  onUpdateProgressExxport: (callback: any) =>
    ipcRenderer.on("update-export-progress-excel", callback),
  exportToExcel: (group_id: number) =>
    ipcRenderer.invoke("export-excel", group_id),
  onSendChatToUser: (cookies: string, dataSend: string, group_id: number) =>
    ipcRenderer.invoke("send-chat-to-user", cookies, dataSend, group_id),
  onUpdateStatusChatFunction: (callback: any) =>
    ipcRenderer.on("update-chat-function-to-view", callback),
  openAccountFacebookTest: (cookies: string, isGetCookie: boolean) =>
    ipcRenderer.invoke("open-account-facebook", cookies, isGetCookie),
  onUpdateCookieToView: (callback: any) =>
    ipcRenderer.on("update-cookie-to-view", callback),
});
console.log("preload");
export {};
