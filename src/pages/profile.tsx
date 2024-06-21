import React, { useState } from "react";
import DashboardTab from "../components/profile/DashboardTab";
import ProfileInfoTab from "../components/profile/ProfileInfoTab";
import ChangePasswordTab from "../components/profile/ChangePasswordTab";

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "profile":
        return <ProfileInfoTab />;
      case "password":
        return <ChangePasswordTab />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Trang cá nhân</h1>

      <div className="mb-4">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`${
              activeTab === "dashboard"
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-500 hover:text-gray-700"
            } px-3 py-2 font-medium text-sm rounded-md`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`${
              activeTab === "profile"
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-500 hover:text-gray-700"
            } px-3 py-2 font-medium text-sm rounded-md`}
          >
            Thông tin cá nhân
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`${
              activeTab === "password"
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-500 hover:text-gray-700"
            } px-3 py-2 font-medium text-sm rounded-md`}
          >
            Đổi mật khẩu
          </button>
        </nav>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default Profile;
