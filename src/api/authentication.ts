import { URL_API } from "../constants/api";
import { ValuePropsGetUser } from "../utils/interface.global";
import Api from "./api";

export const loginUserByAPI = async (props: ValuePropsGetUser) => {
  const reqUrl = URL_API.LOGIN;

  const res = await Api.post(reqUrl, props);
  //console.log("res", res);
  return res;
};
