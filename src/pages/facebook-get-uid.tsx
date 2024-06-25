import React, { useState } from "react";

interface UserData {
  id: number;
  name: string;
  uid: string;
  phone: string | null;
}

declare global {
  interface Window {
    electronAPI: {
      scrapeFacebook: (
        url: string,
        cookies: string,
        searchType: string,
        interactions: number
      ) => Promise<string>;
    };
  }
}

const FacebookLayUID: React.FC = () => {
  const [url, setUrl] = useState("https://www.facebook.com/TungZone.Dev");
  const [userData, setUserData] = useState<UserData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchType, setSearchType] = useState("personal");
  const [interactions, setInteractions] = useState({
    like: false,
    comment: false,
    share: false,
  });
  const itemsPerPage = 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cookies =
      "sb=ZtkwZkBf5OXZZghEcPZVNdm7;datr=Z9kwZiudW8Y6rpF1CJXm6qaS;ps_n=1;ps_l=1;c_user=100007563064463;xs=4%3AIwxfUFkqQFMJsw%3A2%3A1715329181%3A-1%3A7258%3A%3AAcUNTuPKVeAsa6KangG6q1we1RHjrEtB-a3DB2Mo0Cs;dpr=1;wd=1591x905;fr=11t08DKrL4E7zwL8M.AWVeymDgl8Vsba82MmVMttkyIEY.Bmet5U..AAA.0.0.Bmet7L.AWUuBangs50;presence=C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1719328461659%2C%22v%22%3A1%7D;";

    try {
      const result = await window.electronAPI.scrapeFacebook(
        url,
        cookies,
        "",
        0
      );
      console.log("handleSubmit", result);
    } catch (error) {
      console.error("Error:", error);
    }
    // Giả lập dữ liệu từ server
    const mockData = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      uid: `10000${i + 1}`,
      phone: i % 3 === 0 ? null : `0123456${i.toString().padStart(3, "0")}`,
    }));
    setUserData(mockData);
  };

  const handleGetPhone = (uid: string) => {
    console.log(`Getting phone for UID: ${uid}`);
  };

  const handleExportExcel = () => {
    console.log("Exporting data to Excel");
  };

  const handleInteractionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInteractions({
      ...interactions,
      [e.target.name]: e.target.checked,
    });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = userData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Lấy UID từ URL Facebook
      </h1>
      <p className="text-gray-600 mb-6">
        Nhập URL Facebook vào ô bên dưới và nhấn Get để lấy UID.
      </p>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex mb-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Nhập URL Facebook"
            className="flex-grow p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Get
          </button>
        </div>

        <div className="mb-4">
          <label className="inline-flex items-center mr-6">
            <input
              type="radio"
              className="form-radio"
              name="searchType"
              value="personal"
              checked={searchType === "personal"}
              onChange={(e) => setSearchType(e.target.value)}
            />
            <span className="ml-2">Trang cá nhân</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="searchType"
              value="post"
              checked={searchType === "post"}
              onChange={(e) => setSearchType(e.target.value)}
            />
            <span className="ml-2">Trang bài viết</span>
          </label>
        </div>

        {searchType === "post" && (
          <div className="ml-6 mb-4">
            <label className="inline-flex items-center mr-4">
              <input
                type="checkbox"
                className="form-checkbox"
                name="like"
                checked={interactions.like}
                onChange={handleInteractionChange}
              />
              <span className="ml-2">Like</span>
            </label>
            <label className="inline-flex items-center mr-4">
              <input
                type="checkbox"
                className="form-checkbox"
                name="comment"
                checked={interactions.comment}
                onChange={handleInteractionChange}
              />
              <span className="ml-2">Comment</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                name="share"
                checked={interactions.share}
                onChange={handleInteractionChange}
              />
              <span className="ml-2">Share</span>
            </label>
          </div>
        )}
      </form>

      {userData.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Kết quả</h2>
            <button
              onClick={handleExportExcel}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Export Excel
            </button>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 mb-4">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.uid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone ? (
                        user.phone
                      ) : (
                        <button
                          onClick={() => handleGetPhone(user.uid)}
                          className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          Get Phone
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center">
            {Array.from(
              { length: Math.ceil(userData.length / itemsPerPage) },
              (_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              )
            )}
          </div>
        </>
      )}
    </>
  );
};

export default FacebookLayUID;
