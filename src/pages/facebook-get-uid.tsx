import React, { useContext, useEffect, useState } from "react";
import { getPhoneFromUIDByAPI } from "../api/facebook";
import { useSelector } from "react-redux";
import { getUserData } from "../redux/slices/userSlices";
import { showToast } from "../utils/showToast";
import DataContext from "../context/DataContext";
import { set } from "animejs";
import Pagination from "../components/Pagination";
import { ScrapedItem } from "../utils/interface.global";

const FacebookLayUID: React.FC = () => {
  const [url, setUrl] = useState(
    "https://www.facebook.com/rockwaterbay/posts/pfbid0381kU9cju76zs4LToXTLp9HTzVUkBDYC9YEe36d5HMCfEpxnv8jYrS8ew79ofuskpl"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [cookie, setCookie] = useState("");

  const { setIsNeedGetNewToken } = useContext(DataContext)!;

  const [isAutoGetPhone, setIsAutoGetPhone] = useState(false);
  const [currentItemGetPhone, setCurrentItemGetPhone] = useState(-1);

  const dataUser = useSelector(getUserData);
  const [userData, setUserData] = useState<ScrapedItem[]>([]);
  const [searchType, setSearchType] = useState("personal");
  const [interactions, setInteractions] = useState({
    like: false,
    comment: false,
    share: false,
  });
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [indexOfFirstItem, setIndexOfFirstItem] = useState(0);
  const [totalRecord, settotalRecord] = useState(0);

  const [currentItems, setCurrentItems] = useState<ScrapedItem[]>([]);

  useEffect(() => {
    // Đăng ký listener cho updates
    console.log("Init");
    window.electronAPI.readCookieFile().then((savedCookie: string) => {
      setCookie(savedCookie);
    });
    window.electronAPI.onUpdateDataGetUIDArticle((event, data) => {
      console.log("onUpdateDataGetUIDArticle", data);
      //setUserData(data);
      loadDataList(1);
    });
    window.electronAPI.onUpdateStatusToView((event, data: any) => {
      console.log("onUpdateStatusToView", data);
      if (data.status == false) {
        setIsLoading(false);
        setAlertMessage(data.message);
        showToast({
          type: "error",
          message: data.message,
        });
      }
      loadDataList(1);
    });
    // Cleanup listener khi component unmount
    return () => {
      // Remove listener (nếu cần)
      if (isLoading) {
        console.log("Stop");
        window.electronAPI.stopRunTask();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cookie === "") {
      return showToast({
        type: "error",
        message: "Vui lòng nhập cookie ở tab Settings",
      });
    }
    if (url === "") {
      return showToast({
        type: "error",
        message: "Vui lòng nhập link facebook để lấy UID",
      });
    }
    await window.electronAPI.clearDataFromDB();
    loadDataList(1);
    setIsLoading(true);
    setAlertMessage("Đang lấy UID, vui lòng chờ...");

    if (searchType === "personal") {
      getUIDFromLinkProfile();
    } else {
      getUIDFromLinkArticle();
    }
  };

  const getUIDFromLinkProfile = async () => {
    try {
      const result = await window.electronAPI.facebookGetUIDFromProfile(
        url,
        cookie
      );
      //console.log("handleSubmit", result);
      if (result !== null) {
        if (result.message != "") {
          showToast({ type: "error", message: result.message });
        } else {
          await window.electronAPI.addDataFromDB(result);
          loadDataList(1);
        }
      } else {
        showToast({ type: "error", message: "Không tìm thấy UID" });
      }
      setIsLoading(false);
      setAlertMessage("");
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
      setAlertMessage("Lấy UID, bị lỗi");
    }
  };

  const getUIDFromLinkArticle = async () => {
    try {
      const result = await window.electronAPI.facebookGetUIDFromLinkArticle(
        url,
        cookie,
        interactions
      );
      //console.log("getUIDFromLinkArticle", result);
      if (result !== null) {
        //setUserData(result);
      } else {
        showToast({ type: "error", message: "Không tìm thấy UID" });
      }
      setIsLoading(false);
      setAlertMessage("");
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
      setAlertMessage("Lấy UID, bị lỗi");
    }
  };

  useEffect(() => {
    loadDataList(1);
  }, [userData]);

  useEffect(() => {
    loadDataList(currentPage);
  }, [currentPage]);

  const loadDataList = async (_currentPage: number) => {
    const _totalRecord = await window.electronAPI.getTotalCountItem();
    settotalRecord(_totalRecord);
    const _currentItems: ScrapedItem[] =
      await window.electronAPI.getDataForPagination(_currentPage, itemsPerPage);

    const _indexOfFirstItem = _currentPage * itemsPerPage - itemsPerPage;
    setCurrentPage(_currentPage);
    setIndexOfFirstItem(_indexOfFirstItem);
    setCurrentItems(_currentItems);
    console.log("loadDataList totalRecord", _totalRecord);
    console.log("loadDataList _currentItems", _currentItems);
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

  const getIndexInUserData = (uid: string) => {
    return userData.findIndex((item) => item.uid === uid);
  };

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

  const handleExportExcel = () => {
    console.log("Exporting data to Excel");
  };

  const handleInteractionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInteractions({
      ...interactions,
      [e.target.name]: e.target.checked,
    });
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const onStop = () => {
    window.electronAPI.stopRunTask();
    setIsLoading(false);
    setAlertMessage("Dừng lấy thông tin");
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Lấy UID từ URL Facebook
      </h1>
      <p className="text-gray-600 mb-6">
        Nhập URL Facebook vào ô bên dưới và nhấn Get để lấy UID.
      </p>

      <form onSubmit={handleSubmit} className="mb-4">
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
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isLoading ? "..." : "Get"}
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
          <div className="ml-6 mb-2">
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
          </div>
        )}
        <p>
          <i className="text-[10px]">
            Khi bấm lấy thông tin khuyến cáo không nên chuyển sang tab khác.
            <br />
            Để hệ thống tự động lấy hoặc bấm STOP để dừng để đảm bảo nội dung
            lấy về được chính xác và không gây ra lỗi.
          </i>
        </p>
      </form>

      {alertMessage !== "" ? (
        <div className="mb-4 text-center text-[green]">
          <p className="bg-gray-100 px-4 py-2 rounded">{alertMessage}</p>
        </div>
      ) : (
        <></>
      )}

      {isLoading ? (
        <button
          onClick={onStop}
          className="px-4 py-2 w-full text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
          type="submit"
        >
          STOP
        </button>
      ) : (
        <></>
      )}

      {currentItems.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Kết quả ({totalRecord})
            </h2>
            {isLoading ? (
              <></>
            ) : (
              <button
                onClick={handleExportExcel}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Export Excel
              </button>
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
                    Phone
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((user, index: number) => (
                  <tr key={indexOfFirstItem + index + 1}>
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
                      {user.phone ? (
                        user.phone
                      ) : currentItemGetPhone === indexOfFirstItem + index ? (
                        <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-xs">
                          Loading..
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGetPhone(user)}
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

export default FacebookLayUID;
