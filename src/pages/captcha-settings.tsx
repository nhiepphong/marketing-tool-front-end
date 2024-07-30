import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserData, updateData } from "../redux/slices/userSlices";
import {
  getUserInfoByAPI,
  requestGenerateNewTokenAPIForCaptcha,
} from "../api/user";
import { showToast } from "../utils/showToast";
import { URL_API } from "../constants/api";

const CaptchaSettings: React.FC = () => {
  const dataUser = useSelector(getUserData);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const [tokenAPI, setTokenAPI] = useState("");

  useEffect(() => {
    if (dataUser) {
      getProfile();
    }
  }, []);

  const getProfile = async () => {
    const result: any = await getUserInfoByAPI({}, dataUser.token.accessToken);
    console.log("getProfile", result);
    if (result.status === 200) {
      setTokenAPI(result.data.data.user.tokenAPICaptcha);
      dispatch(
        updateData({
          token: dataUser.token,
          user: result.data.data.user,
        } as any)
      );
    }
  };
  const handleGenerateNewToken = async () => {
    setIsLoading(true);
    const result: any = await requestGenerateNewTokenAPIForCaptcha(
      {},
      dataUser.token.accessToken
    );
    setIsLoading(false);
    if (result.status === 200) {
      if (result.data.status) {
        showToast({ type: "success", message: result.data.message });
        getProfile();
      } else {
        showToast({ type: "error", message: result.data.message });
      }
    } else {
      showToast({ type: "error", message: result.data.message });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cài đặt API Captcha</h1>
      {isLoading ? (
        <></>
      ) : (
        <>
          <div className="mb-4">
            <label
              htmlFor="cookie"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Token API
            </label>
            <textarea
              id="token"
              disabled={true}
              rows={2}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              value={tokenAPI}
            />
          </div>
          <button
            onClick={handleGenerateNewToken}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Tạo Token mới
          </button>
          <div className="mb-4 text-sm text-gray-600 mt-[20px]">
            <p>Hướng dẫn đấu nối API</p>
          </div>
          <div className="mb-4 text-sm text-gray-600 mt-[10px]">
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
              <code>{`
API Endpoint: POST ${URL_API.CAPTCHA_API_FOR_USER}

Headers:
  Authorization: Bearer YOUR_API_TOKEN
  Content-Type: multipart/form-data

Body:
  image: File (Captcha image file)

Response:
  {
    "prediction": "ABC123" // The predicted captcha text
  }

Error Response:
  {
    "error": "Error message"
  }
    `}</code>
            </pre>
          </div>
        </>
      )}
    </div>
  );
};

export default CaptchaSettings;
