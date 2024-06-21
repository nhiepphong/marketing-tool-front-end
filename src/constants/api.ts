export enum URL_API {
  LOGIN = "http://localhost:8000/auth/login",
  GET_USERINFO = "http://localhost:8000/users/profile",
  REGISTER = "http://localhost:8000/auth/register",
  FORGOT_PASSWORD = "http://localhost:8000/auth/forgot-pass",
  REFRESH_TOKEN = "http://localhost:8000/auth/refresh-token",

  RESEND_OTP = "https://api.aeonvietnamdontrieumember.com/api/resend-otp",
  CHANGE_PASSWORD = "https://api.aeonvietnamdontrieumember.com/api/change-pass",
  FORGOT_PASSWORD_STEP1 = "https://api.aeonvietnamdontrieumember.com/api/forgot-pass",
  FORGOT_PASSWORD_STEP2 = "https://api.aeonvietnamdontrieumember.com/api/forgot-pass-verify-otp",

  GAME_CHECK_GAME = "https://api.aeonvietnamdontrieumember.com/api/game/check-game",
  GAME_SAVE_GAME = "https://api.aeonvietnamdontrieumember.com/api/game/post-score-game",
  GAME_DOI_QUA = "https://api.aeonvietnamdontrieumember.com/api/game/post-doi-qua-game",
  GAME_GET_QUA_CUA_TOI = "https://api.aeonvietnamdontrieumember.com/api/game/qua-cua-toi-game",
  GAME_GET_DANH_SACH_TRUNG_THUONG = "https://api.aeonvietnamdontrieumember.com/api/game/danh-sach-trung-thuong",
  GAME_CHECK_THEM_LUOT_FACEBOOK = "https://api.aeonvietnamdontrieumember.com/api/game/them-luot-quay-facebook",

  CAO_THE_CAO_THE = "https://api.aeonvietnamdontrieumember.com/api/cao-the-trung-thuong",
  CAO_THE_DATA_STATIC = "https://api.aeonvietnamdontrieumember.com/api/get-data-static",
  CAO_THE_GET_DANH_SACH_TRUNG_THUONG = "https://api.aeonvietnamdontrieumember.com/api/cao-the/danh-sach-trung-thuong",
}
