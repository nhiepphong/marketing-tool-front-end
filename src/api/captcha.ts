import { URL_API } from "../constants/api";
import Api from "./api";

export const getListHistoryCaptchaByAPI = async (params: any, jwt: string) => {
  try {
    const reqUrl = URL_API.CAPTCHA_GET_HISTORY;
    const res = await Api.post(reqUrl, params, jwt);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};
