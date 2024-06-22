import React, { useContext, useEffect, useState } from "react";
import { getUserData, updateData } from "../../redux/slices/userSlices";
import { useDispatch, useSelector } from "react-redux";
import { getUserInfoByAPI, updateProfileByAPI } from "../../api/user";
import DataContext from "../../context/DataContext";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../utils/showToast";

const ProfileInfoTab: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isNeedGetNewToken, setIsNeedGetNewToken } = useContext(DataContext)!;
  const dataUser = useSelector(getUserData);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    getProfile();
  }, []);

  useEffect(() => {
    if (dataUser) {
      setFormData({
        name: dataUser.user?.name || "",
        phone: dataUser.user?.phone || "",
        email: dataUser.user?.email || "",
      });
    }
  }, [dataUser]);

  const getProfile = async () => {
    const result: any = await getUserInfoByAPI({}, dataUser.token.accessToken);
    //console.log("getProfile", result);
    if (result.status === 200) {
      dispatch(
        updateData({
          token: dataUser.token,
          user: result.data.data.user,
        } as any)
      );
    } else if (result.status === 403) {
      setIsNeedGetNewToken(true);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result: any = await updateProfileByAPI(
      formData,
      dataUser.token.accessToken
    );
    setIsLoading(false);
    console.log("updateProfile", result);
    if (result.status === 200) {
      dispatch(
        updateData({
          token: dataUser.token,
          user: result.data.data.user,
        } as any)
      );
      showToast({ type: "success", message: result.data.message });
    } else {
      showToast({ type: "error", message: result.data.message });
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Thông tin cá nhân
        </h3>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <form onSubmit={handleUpdateProfile}>
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Họ và tên</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Số điện thoại
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <input
                  type="tel"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
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
                Cập nhật thông tin
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileInfoTab;
