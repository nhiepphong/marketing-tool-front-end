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

export const postforgotPassword = async (params: any) => {
  try {
    const reqUrl = URL_API.FORGOT_PASSWORD;
    const res = await Api.post(reqUrl, params);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};

export const postforgotPasswordStep2 = async (params: any) => {
  try {
    const reqUrl = URL_API.FORGOT_PASSWORD_STEP2;
    const res = await Api.post(reqUrl, params);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};

export const getUserInfoByAPI = async (params: any) => {
  try {
    const reqUrl = URL_API.GET_USERINFO;
    const res = await Api.post(reqUrl, params);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};
