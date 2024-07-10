export enum PAGE_EXTEND {
  PAGE_GAME = "http://localhost:3000",
}

export interface ElectronAPI {
  facebookGetUIDFromProfile: (url: string, cookies: string) => Promise<any>;
  facebookGetUIDFromLinkArticle: (
    url: string,
    cookies: string,
    interactions: any
  ) => Promise<any>;
  onUpdateDataGetUIDArticle: (
    callback: (event: Electron.IpcRendererEvent, data: any[]) => void
  ) => void;
  onUpdateStatusToView: (
    callback: (event: Electron.IpcRendererEvent, data: any) => void
  ) => void;
  readCookieFile: () => Promise<string>;
  saveCookieFile: (cookie: string) => Promise<void>;
  stopRunTask: () => Promise<void>;
}
