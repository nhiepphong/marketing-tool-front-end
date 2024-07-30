/*
export enum URL_API {
  LOGIN = "http://localhost:8001/auth/login",
  GET_USERINFO = "http://localhost:8001/users/profile",
  UPDATE_PROFILE = "http://localhost:8001/users/update-profile",
  UPDATE_PASSWORD = "http://localhost:8001/users/update-password",
  REGISTER = "http://localhost:8001/auth/register",
  FORGOT_PASSWORD = "http://localhost:8001/auth/forgot-pass",
  REFRESH_TOKEN = "http://localhost:8001/auth/refresh-token",

  GET_PACKAGES = "http://localhost:8001/store/get-packages",
  BUY_PACKAGE = "http://localhost:8001/store/buy-package",
  GET_HISTORY_PAYMENT = "http://localhost:8001/store/get-list-bill-payment-package",
  CANCEL_PACKAGE = "http://localhost:8001/store/cancel-package",

  FB_GET_PHONE_FROM_UID = "http://localhost:8001/facebook/get-phone-from-uid",
}
*/
export enum URL_API {
  LOGIN = "https://api.martool.online/auth/login",
  GET_USERINFO = "https://api.martool.online/users/profile",
  UPDATE_PROFILE = "https://api.martool.online/users/update-profile",
  UPDATE_PASSWORD = "https://api.martool.online/users/update-password",
  REGISTER = "https://api.martool.online/auth/register",
  FORGOT_PASSWORD = "https://api.martool.online/auth/forgot-pass",
  REFRESH_TOKEN = "https://api.martool.online/auth/refresh-token",
  REFRESH_TOKEN_API_CAPTCHA = "https://api.martool.online/users/refresh-token-captcha",

  GET_PACKAGES = "https://api.martool.online/store/get-packages",
  BUY_PACKAGE = "https://api.martool.online/store/buy-package",
  GET_HISTORY_PAYMENT = "https://api.martool.online/store/get-list-bill-payment-package",
  CANCEL_PACKAGE = "https://api.martool.online/store/cancel-package",

  FB_GET_PHONE_FROM_UID = "https://api.martool.online/facebook/get-phone-from-uid",

  CAPTCHA_API_FOR_USER = "https://api.martool.online/captcha/recognition-captcha",
}
