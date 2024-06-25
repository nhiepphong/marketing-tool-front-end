import { URL_API } from "../constants/api";
import Api from "./api";

export const postRegister = async (params: any) => {
  try {
    const reqUrl = URL_API.REGISTER;
    const res = await Api.post(reqUrl, params);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};

export const getUserInfoByAPI = async (params: any, jwt: string) => {
  try {
    const reqUrl = URL_API.GET_USERINFO;
    const res = await Api.get(reqUrl, params, jwt);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};

export const updateProfileByAPI = async (params: any, jwt: string) => {
  try {
    const reqUrl = URL_API.UPDATE_PROFILE;
    const res = await Api.post(reqUrl, params, jwt);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};

export const updatePasswordByAPI = async (params: any, jwt: string) => {
  try {
    const reqUrl = URL_API.UPDATE_PASSWORD;
    const res = await Api.post(reqUrl, params, jwt);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};

export const postforgotPassword = async (params: any, jwt: string) => {
  try {
    const reqUrl = URL_API.UPDATE_PASSWORD;
    const res = await Api.post(reqUrl, params, jwt);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};

export const getNewTokenByAPI = async (params: any, jwt: string) => {
  try {
    const reqUrl = URL_API.REFRESH_TOKEN;
    const res = await Api.post(reqUrl, params, jwt);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};
