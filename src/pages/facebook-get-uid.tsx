import React, { useState } from "react";

interface UserData {
  id: number;
  name: string;
  uid: string;
  phone: string | null;
}

const FacebookLayUID: React.FC = () => {
  const [url, setUrl] = useState("");
  const [userData, setUserData] = useState<UserData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

      <form onSubmit={handleSubmit} className="mb-8 flex">
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
