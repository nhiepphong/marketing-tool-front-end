import { GroupItem } from "../utils/interface.global";

export enum PAGE_EXTEND {
  PAGE_GAME = "http://localhost:3000",
}

export interface ElectronAPI {
  facebookGetUIDFromProfile: (url: string, cookies: string) => Promise<any>;
  facebookGetUIDFromLinkArticle: (
    group_id: number,
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
  clearDataFromDB: () => Promise<void>;
  addDataFromDB: (item: any) => Promise<any>;
  getTotalCountItem: (group_id: number) => Promise<number>;
  getDataForPagination: (
    groupID: number,
    currentPage: number,
    itemsPerPage: number
  ) => Promise<any[]>;
  newGroupFromDB: (item: GroupItem) => Promise<any>;
  getAllGroup: () => Promise<any>;
  showLog: (
    callback: (event: Electron.IpcRendererEvent, data: any) => void
  ) => void;
  onUpdateProgressExxport: (
    callback: (event: Electron.IpcRendererEvent, data: number) => void
  ) => void;
  exportToExcel: (group_id: number) => Promise<any>;
}
