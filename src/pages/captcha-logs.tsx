import React, { useState, useEffect, useContext } from "react";
import Pagination from "../components/Pagination";
import { showToast } from "../utils/showToast";
import { useSelector } from "react-redux";
import { getUserData } from "../redux/slices/userSlices";
import DataContext from "../context/DataContext";
import { getListHistoryCaptchaByAPI } from "../api/captcha";
import { formatDateTime } from "../utils/utils";

interface HistoryItem {
  id: string;
  input: string;
  result: number;
  ip: string;
  createdAt: string;
}

const CaptchaLogs: React.FC = () => {
  const dataUser = useSelector(getUserData);
  const { setIsNeedGetNewToken } = useContext(DataContext)!;

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<any>({
    currentPage: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1,
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (dataUser) {
      loadDataList();
    }
  }, [dataUser, currentPage]);

  const loadDataList = async () => {
    const result: any = await getListHistoryCaptchaByAPI(
      { page: currentPage },
      dataUser.token.accessToken
    );
    setIsLoading(false);
    console.log("ABC", result);
    if (result) {
      if (result.status === 200) {
        if (result.data.status) {
          setHistory(result.data.data);
          setMetadata(result.data.metadata);
        } else {
          showToast({ type: "error", message: result.data.message });
        }
      } else {
        showToast({ type: "error", message: result.data.message });
      }
    } else {
      showToast({ type: "error", message: "Lỗi kết nối" });
    }
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lịch sử giải captcha</h1>
      <div className="mt-2">
        {history.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Kết quả ({metadata.totalCount})
              </h2>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 mb-4">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kết quả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((item: HistoryItem, index: number) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.input}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.result}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.ip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(item.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={metadata.totalPages}
              onPageChange={paginate}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CaptchaLogs;
