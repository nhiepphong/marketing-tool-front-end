export enum URL_API {
  LOGIN = "http://192.168.1.16:8000/auth/login",
  GET_USERINFO = "http://192.168.1.16:8000/users/profile",
  UPDATE_PROFILE = "http://192.168.1.16:8000/users/update-profile",
  UPDATE_PASSWORD = "http://192.168.1.16:8000/users/update-password",
  REGISTER = "http://192.168.1.16:8000/auth/register",
  FORGOT_PASSWORD = "http://192.168.1.16:8000/auth/forgot-pass",
  REFRESH_TOKEN = "http://192.168.1.16:8000/auth/refresh-token",

  GET_PACKAGES = "http://192.168.1.16:8000/store/get-packages",
  BUY_PACKAGE = "http://192.168.1.16:8000/store/buy-package",
  GET_HISTORY_PAYMENT = "http://192.168.1.16:8000/store/get-list-bill-payment-package",
  CANCEL_PACKAGE = "http://192.168.1.16:8000/store/cancel-package",

  FB_GET_PHONE_FROM_UID = "http://192.168.1.16:8000/facebook/get-phone-from-uid",
}
