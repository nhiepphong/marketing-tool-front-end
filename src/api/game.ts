import { URL_API } from "../constants/api";
import Api from "./api";

export const postGetListWinner = async (params: any) => {
  try {
    const reqUrl = URL_API.GET_LIST_WINNER;
    const res = await Api.post(reqUrl, params);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};

export const postCheckGame = async (params: any) => {
  try {
    const reqUrl = URL_API.GAME_CHECK_GAME;
    const res = await Api.post(reqUrl, params);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};

export const postScoreGame = async (params: any) => {
  try {
    const reqUrl = URL_API.GAME_SAVE_GAME;
    const res = await Api.post(reqUrl, params);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};

export const postDoiQuaGame = async (params: any) => {
  try {
    const reqUrl = URL_API.GAME_DOI_QUA;
    const res = await Api.post(reqUrl, params);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};

export const postQuaCuaToiGame = async (params: any) => {
  try {
    const reqUrl = URL_API.GAME_GET_QUA_CUA_TOI;
    const res = await Api.post(reqUrl, params);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};

export const postDanhSachTrungThuongCaoThe = async (params: any) => {
  try {
    const reqUrl = URL_API.CAO_THE_GET_DANH_SACH_TRUNG_THUONG;
    const res = await Api.post(reqUrl, params);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};

export const postCaoThe = async (params: any) => {
  try {
    const reqUrl = URL_API.CAO_THE_CAO_THE;
    const res = await Api.post(reqUrl, params);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};

export const getDataStatic = async (params: any) => {
  try {
    const reqUrl = URL_API.CAO_THE_DATA_STATIC;
    const res = await Api.get(reqUrl, params);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};

export const postCheckThemLuotFacebook = async (params: any) => {
  try {
    const reqUrl = URL_API.GAME_CHECK_THEM_LUOT_FACEBOOK;
    const res = await Api.post(reqUrl, params);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};
