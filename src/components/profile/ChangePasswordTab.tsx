import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserData, updateData } from "../../redux/slices/userSlices";
import { updatePasswordByAPI } from "../../api/user";
import { showToast } from "../../utils/showToast";

const ChangePasswordTab: React.FC = () => {
  const dispatch = useDispatch();
  const dataUser = useSelector(getUserData);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast({
        type: "error",
        message: "Mật khẩu mới và xác nhận mật khẩu không khớp",
      });
      return;
    }
    setIsLoading(true);
    const result: any = await updatePasswordByAPI(
      { currentPassword, newPassword },
      dataUser.token.accessToken
    );
    setIsLoading(false);
    console.log("updateProfile", result);
    if (result.status === 200) {
      dispatch(
        updateData({
          token: result.data.data.token,
          user: dataUser.user,
        } as any)
      );
      showToast({ type: "success", message: result.data.message });
    } else {
      showToast({ type: "error", message: result.data.message });
    }
  };

  return (
    <>
      {dataUser ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Đổi mật khẩu
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <form onSubmit={handleChangePassword}>
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Mật khẩu hiện tại
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <input
                      type="password"
                      className="w-full px-3 py-2 border rounded-md"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Mật khẩu mới
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <input
                      type="password"
                      className="w-full px-3 py-2 border rounded-md"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Xác nhận mật khẩu mới
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <input
                      type="password"
                      className="w-full px-3 py-2 border rounded-md"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </dd>
                </div>
              </dl>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                {isLoading ? (
                  <div className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-indigo focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Đăng cập nhật thông tin
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Đổi mật khẩu
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Chưa có thông tin người dùng
            </h3>
          </div>
        </div>
      )}
    </>
  );
};

export default ChangePasswordTab;
