import React, { useState } from "react";
import FacebookLayUID from "./facebook-get-uid";
import FacebookUIDToPhone from "./facebook-get-phone";
import Sidebar from "../components/facebook/Sidebar";
import FacebookHistory from "./facebook-history";
import FacebookSettings from "./facebook-settings";
import FacebookChat from "./facebook-chat";

const FacebookTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState("layUID");

  const renderMainContent = () => {
    switch (activeTab) {
      case "layUID":
        return <FacebookLayUID />;
      case "uidToPhone":
        return <FacebookUIDToPhone />;
      case "history":
        return <FacebookHistory />;
      case "chat":
        return <FacebookChat />;
      case "settings":
        return <FacebookSettings />;
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

export default FacebookTab;
