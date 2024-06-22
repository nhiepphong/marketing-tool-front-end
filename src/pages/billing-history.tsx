import React, { useEffect, useState } from "react";
import PaymentPopup from "../components/package/payment-popup";
import { useDispatch, useSelector } from "react-redux";
import { getUserData } from "../redux/slices/userSlices";
import {
  cancelPackageByAPI,
  getHistoryPaymentPackageByAPI,
} from "../api/store";
import { showToast } from "../utils/showToast";
import { set } from "animejs";
import { formatDateTime } from "../utils/utils";

interface PurchaseHistoryItem {
  id: string;
  packageName: string;
  amount: number;
  transferContent: string;
  status: 0 | 1 | 2;
  date: string;
}

const PurchaseHistoryPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const dataUser = useSelector(getUserData);
  const [metadata, setMetadata] = useState<any>({
    currentPage: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1,
  });
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryItem[]>(
    []
  );

  useEffect(() => {
    if (dataUser) {
      getHistoryPaymentPackage();
    }
  }, [dataUser, currentPage]);

  const getHistoryPaymentPackage = async () => {
    const result: any = await getHistoryPaymentPackageByAPI(
      { page: currentPage },
      dataUser.token.accessToken
    );
    setIsLoading(false);
    if (result.status === 200) {
      if (result.data.status) {
        setPurchaseHistory(result.data.data);
        setMetadata(result.data.metadata);
      } else {
        showToast({ type: "error", message: result.data.message });
      }
    } else {
      showToast({ type: "error", message: result.data.message });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCancel = async (item: PurchaseHistoryItem) => {
    setIsLoading(true);
    const result: any = await cancelPackageByAPI(
      { id: item.id },
      dataUser.token.accessToken
    );
    setIsLoading(false);
    if (result.status === 200) {
      if (result.data.status) {
        getHistoryPaymentPackage();
        showToast({ type: "success", message: result.data.message });
      } else {
        showToast({ type: "error", message: result.data.message });
      }
    } else {
      showToast({ type: "error", message: result.data.message });
    }
  };

  const handleViewDetails = (item: PurchaseHistoryItem) => {
    setSelectedItem(item);
    setIsPaymentPopupOpen(true);
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "text-yellow-600 bg-yellow-100";
      case 1:
        return "text-green-600 bg-green-100";
      case 2:
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Lịch sử mua hàng</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên gói
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nội dung chuyển
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {purchaseHistory.map((item: any) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.package.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.price.toLocaleString()} VND
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.codePayment}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {item.status === 0
                      ? "Chờ thanh toán"
                      : item.status === 1
                      ? "Đã thanh toán"
                      : "Đã hủy"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDateTime(item.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {item.status === 0 && (
                    <>
                      <button
                        onClick={() => handleViewDetails(item)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        Xem chi tiết
                      </button>
                      <button
                        onClick={() => handleCancel(item)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hủy
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-center">
        {Array.from({ length: metadata.totalPages }, (_, i) => i + 1).map(
          (page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === page
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>
      {selectedItem && (
        <PaymentPopup
          isOpen={isPaymentPopupOpen}
          onClose={() => setIsPaymentPopupOpen(false)}
          amount={selectedItem.price}
          transferContent={selectedItem.codePayment}
        />
      )}
    </div>
  );
};

export default PurchaseHistoryPage;
