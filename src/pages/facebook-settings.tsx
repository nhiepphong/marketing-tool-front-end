import React, { useState, useEffect } from "react";
const FacebookSettings: React.FC = () => {
  const [cookie, setCookie] = useState("");

  useEffect(() => {
    // Đọc cookie từ file khi component được mount
    window.electronAPI.readCookieFile().then((savedCookie: string) => {
      setCookie(savedCookie);
    });
  }, []);

  const handleSave = async () => {
    try {
      await window.electronAPI.saveCookieFile(cookie);
      alert("Cookie đã được lưu thành công!");
    } catch (error) {
      console.error("Lỗi khi lưu cookie:", error);
      alert("Có lỗi xảy ra khi lưu cookie.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cài đặt Facebook</h1>
      <div className="mb-4">
        <label
          htmlFor="cookie"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Cookie Facebook
        </label>
        <textarea
          id="cookie"
          rows={5}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
          value={cookie}
          onChange={(e) => setCookie(e.target.value)}
          placeholder="Nhập cookie Facebook của bạn vào đây"
        />
      </div>
      <div className="mb-4 text-sm text-gray-600">
        <p>
          Để lấy cookie Facebook, bạn có thể làm theo hướng dẫn{" "}
          <a
            href="https://example.com/huong-dan-lay-cookie"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            tại đây
          </a>
          .
        </p>
      </div>
      <button
        onClick={handleSave}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Lưu
      </button>
    </div>
  );
};

export default FacebookSettings;
