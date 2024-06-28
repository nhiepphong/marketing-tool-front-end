import { URL_API } from "../constants/api";
import Api from "./api";

export const getPhoneFromUIDByAPI = async (params: any, jwt: string) => {
  try {
    const reqUrl = URL_API.FB_GET_PHONE_FROM_UID;
    const res = await Api.post(reqUrl, params, jwt);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};
