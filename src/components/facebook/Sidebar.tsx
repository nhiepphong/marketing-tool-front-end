// Sidebar.tsx
import React from "react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="w-64 bg-gray-100 p-4 h-screen">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Facebook</h2>
      <ul>
        <li
          className={`mb-2 cursor-pointer p-2 rounded text-gray-700 ${
            activeTab === "layUID" ? "bg-gray-200" : "hover:bg-gray-200"
          }`}
          onClick={() => onTabChange("layUID")}
        >
          Lấy UID
        </li>
        <li
          className={`mb-2 cursor-pointer p-2 rounded text-gray-700 ${
            activeTab === "uidToPhone" ? "bg-gray-200" : "hover:bg-gray-200"
          }`}
          onClick={() => onTabChange("uidToPhone")}
        >
          UID sang Phone
        </li>
        <li
          className={`mb-2 cursor-pointer p-2 rounded text-gray-700 ${
            activeTab === "history" ? "bg-gray-200" : "hover:bg-gray-200"
          }`}
          onClick={() => onTabChange("history")}
        >
          Lịch sử
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
