import React from "react";
import { getUserData } from "../../redux/slices/userSlices";
import { useSelector } from "react-redux";

const DashboardTab: React.FC = () => {
  const dataUser = useSelector(getUserData);

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Dashboard
        </h3>
      </div>
      <div className="border-t border-gray-200">
        {dataUser ? (
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Số lượng còn lại
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {dataUser.user.countCanUser.toLocaleString()}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Số lượng đã mua
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {dataUser.user.totalCanUser.toLocaleString()}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Số lượng đã dùng
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {(
                  dataUser.user.totalCanUser - dataUser.user.countCanUser
                ).toLocaleString()}
              </dd>
            </div>
          </dl>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default DashboardTab;
