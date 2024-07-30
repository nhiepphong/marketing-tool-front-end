import React, { useState } from "react";
import Sidebar from "../components/captcha/Sidebar";
import CaptchaSettings from "./captcha-settings";
import CaptchaLogs from "./captcha-logs";

const CaptchaTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState("settings");

  const renderMainContent = () => {
    switch (activeTab) {
      case "logs":
        return <CaptchaLogs />;
      case "settings":
        return <CaptchaSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 p-8 overflow-auto">{renderMainContent()}</div>
    </div>
  );
};

export default CaptchaTab;
