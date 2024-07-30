// Sidebar.tsx
import React from "react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="w-64 bg-gray-100 p-4 h-screen">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Captcha</h2>
      <ul>
        <li
          className={`mb-2 cursor-pointer p-2 rounded text-gray-700 ${
            activeTab === "settings" ? "bg-gray-200" : "hover:bg-gray-200"
          }`}
          onClick={() => onTabChange("settings")}
        >
          Settings
        </li>
        <li
          className={`mb-2 cursor-pointer p-2 rounded text-gray-700 ${
            activeTab === "logs" ? "bg-gray-200" : "hover:bg-gray-200"
          }`}
          onClick={() => onTabChange("logs")}
        >
          History
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
