const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  scrapeFacebook: (
    url: string,
    cookies: string,
    searchType: string,
    interactions: string
  ) =>
    ipcRenderer.invoke(
      "scrape-facebook",
      url,
      cookies,
      searchType,
      interactions
    ),
  getPhoneNumber: (uid: string) => ipcRenderer.invoke("get-phone-number", uid),
});

export {};
