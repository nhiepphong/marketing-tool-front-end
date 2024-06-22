import { URL_API } from "../constants/api";
import Api from "./api";

export const getAllPackagesByAPI = async (params: any, jwt: string) => {
  try {
    const reqUrl = URL_API.GET_PACKAGES;
    const res = await Api.get(reqUrl, params, jwt);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};

export const buyPackageByAPI = async (params: any, jwt: string) => {
  try {
    const reqUrl = URL_API.BUY_PACKAGE;
    const res = await Api.post(reqUrl, params, jwt);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};

export const getHistoryPaymentPackageByAPI = async (
  params: any,
  jwt: string
) => {
  try {
    const reqUrl = URL_API.GET_HISTORY_PAYMENT;
    const res = await Api.post(reqUrl, params, jwt);
    //console.log("getUserInfoByAPI", res);
    return res;
  } catch (error) {
    //console.log("getUserInfoByAPI error", error);
    return null;
  }
};
