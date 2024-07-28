// Sidebar.tsx
import React, { useContext, useEffect, useState } from "react";
import Pagination from "../Pagination";
import { GroupItem, ScrapedItem } from "../../utils/interface.global";
import { useSelector } from "react-redux";
import { getUserData } from "../../redux/slices/userSlices";
import { getPhoneFromUIDByAPI } from "../../api/facebook";
import { showToast } from "../../utils/showToast";
import DataContext from "../../context/DataContext";

interface ListViewProps {
  isLoading: boolean;
  group: GroupItem | null;
  textReload: string;
}

const ListViewFaebookChat: React.FC<ListViewProps> = ({
  isLoading,
  group,
  textReload,
}) => {
  const dataUser = useSelector(getUserData);
  const { setIsNeedGetNewToken } = useContext(DataContext)!;
  const [userData, setUserData] = useState<ScrapedItem[]>([]);
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [indexOfFirstItem, setIndexOfFirstItem] = useState(0);
  const [totalRecord, settotalRecord] = useState(0);

  const [currentItems, setCurrentItems] = useState<ScrapedItem[]>([]);

  const [isExporting, setIsExporting] = useState(false);
  const [progressExport, setProgressExport] = useState(0);

  const [isAutoGetPhone, setIsAutoGetPhone] = useState(false);
  const [currentItemGetPhone, setCurrentItemGetPhone] = useState(-1);

  const handleExportExcel = async () => {
    setIsExporting(true);
    setProgressExport(0);

    window.electronAPI.onUpdateProgressExxport((event, value: number) => {
      console.log("onUpdateProgressExxport", value);
      setProgressExport(Math.round(value));
    });

    try {
      const result = await window.electronAPI.exportToExcel(
        group ? group.id : 0
      );
      if (result.success) {
        if (result.filePath) {
          alert(`Excel file exported successfully to: ${result.filePath}`);
        } else {
          alert("Export was cancelled");
        }
      } else {
        alert(`Export failed: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const tmp = textReload.split("|");
    if (tmp.length == 2) {
      if (parseInt(tmp[0]) == 0) {
        loadDataList(currentPage);
      } else {
        loadDataList(1);
      }
    }
  }, [textReload]);

  useEffect(() => {
    loadDataList(1);
  }, [userData, group]);

  useEffect(() => {
    loadDataList(currentPage);
  }, [currentPage]);

  const loadDataList = async (_currentPage: number) => {
    const group_id = group ? group.id : 0;
    const _totalRecord = await window.electronAPI.getTotalCountItem(group_id);
    settotalRecord(_totalRecord);
    const _currentItems: ScrapedItem[] =
      await window.electronAPI.getDataForPagination(
        group_id,
        _currentPage,
        itemsPerPage
      );

    const _indexOfFirstItem = _currentPage * itemsPerPage - itemsPerPage;
    setCurrentPage(_currentPage);
    setIndexOfFirstItem(_indexOfFirstItem);
    setCurrentItems(_currentItems);
  };

  useEffect(() => {
    if (isAutoGetPhone) {
      if (currentItemGetPhone < userData.length) {
        handleGetPhone(userData[currentItemGetPhone]);
      } else {
        showToast({ type: "success", message: "Đã lấy xong số điện thoại" });
      }
    }
  }, [isAutoGetPhone, currentItemGetPhone]);

  const handleGetPhone = async (item: ScrapedItem) => {
    const index = getIndexInUserData(item.uid);
    setCurrentItemGetPhone(index);
    await getPhoneFromUID(item);

    if (isAutoGetPhone) {
      setCurrentItemGetPhone(index + 1);
    } else {
      setCurrentItemGetPhone(-1);
    }
  };

  const getPhoneFromUID = async (item: ScrapedItem) => {
    const result: any = await getPhoneFromUIDByAPI(
      item,
      dataUser.token.accessToken
    );
    if (result !== null) {
      if (result.status === 200) {
        if ((result.data.status = true)) {
          const phones = result.data.data.phones;
          let _phones = phones.map((phone: any) => phone.number);
          userData[getIndexInUserData(item.uid)].phone = _phones.join(", ");
          setUserData([...userData]);
        } else {
          showToast({ type: "error", message: result.data.message });
        }
      }
      if (result.status === 403) {
        setIsNeedGetNewToken(true);
      } else {
        showToast({ type: "error", message: result.data.message });
      }
    } else {
      showToast({ type: "error", message: "Có lỗi xảy ra vui lòng thử lại" });
    }
  };

  const getIndexInUserData = (uid: string) => {
    return userData.findIndex((item) => item.uid === uid);
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <>
      {currentItems.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Kết quả ({totalRecord})
            </h2>
            {isLoading ? (
              <></>
            ) : (
              <div>
                <button
                  onClick={handleExportExcel}
                  disabled={isExporting}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {isExporting
                    ? `Exporting... ${progressExport}%`
                    : "Export to Excel"}
                </button>
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 mb-4">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((user, index: number) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.uid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.is_send ? (
                        <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-xs">
                          Đã gửi
                        </button>
                      ) : (
                        <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-xs">
                          Chưa gửi
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalRecord / itemsPerPage)}
            onPageChange={paginate}
          />
        </>
      )}
    </>
  );
};

export default ListViewFaebookChat;
