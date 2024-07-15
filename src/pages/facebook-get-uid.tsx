import React, { useContext, useEffect, useState } from "react";
import { getPhoneFromUIDByAPI } from "../api/facebook";
import { useSelector } from "react-redux";
import { getUserData } from "../redux/slices/userSlices";
import { showToast } from "../utils/showToast";
import DataContext from "../context/DataContext";
import Pagination from "../components/Pagination";
import { GroupItem, ScrapedItem } from "../utils/interface.global";
import { getDateNowWithString, getTimeNowToString } from "../utils/utils";
import ListViewFaebook from "../components/facebook/ListViewProps";

const FacebookLayUID: React.FC = () => {
  const [url, setUrl] = useState(
    "https://www.facebook.com/rockwaterbay/posts/pfbid0381kU9cju76zs4LToXTLp9HTzVUkBDYC9YEe36d5HMCfEpxnv8jYrS8ew79ofuskpl"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [cookie, setCookie] = useState("");

  const [groupData, setGroupData] = useState<GroupItem | null>(null);
  const dataUser = useSelector(getUserData);

  const [searchType, setSearchType] = useState("personal");
  const [interactions, setInteractions] = useState({
    like: false,
    comment: false,
    share: false,
  });

  const [textReload, setTextReload] = useState("");

  useEffect(() => {
    // Đăng ký listener cho updates
    console.log("Init");
    window.electronAPI.readCookieFile().then((savedCookie: string) => {
      setCookie(savedCookie);
    });
    window.electronAPI.onUpdateDataGetUIDArticle((event, data) => {
      //console.log("onUpdateDataGetUIDArticle", data);
      //setUserData(data);
      setTextReload("0|" + getTimeNowToString());
    });
    window.electronAPI.onUpdateStatusToView((event, data: any) => {
      //console.log("onUpdateStatusToView", data);
      if (data.status == false) {
        setIsLoading(false);
        setAlertMessage(data.message);
        showToast({
          type: "error",
          message: data.message,
        });
      }

      window.electronAPI.showLog((event, data) => {
        console.log("showLog", data);
      });

      setTextReload("1|" + getTimeNowToString());
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
    //await window.electronAPI.clearDataFromDB();
    try {
      const group = await window.electronAPI.newGroupFromDB({
        id: 0,
        name: searchType,
        date: getDateNowWithString(),
        link: url,
        status: 1,
      });
      setGroupData(group);
      console.log("group", group);
    } catch (error) {
      console.log("Group error", error);
      showToast({ type: "error", message: "Có lỗi không tạo được nhóm" });
    }
  };

  useEffect(() => {
    if (groupData != null) {
      setTextReload("1|" + getTimeNowToString());
      setIsLoading(true);
      setAlertMessage("Đang lấy UID, vui lòng chờ...");

      if (searchType === "personal") {
        getUIDFromLinkProfile();
      } else {
        getUIDFromLinkArticle();
      }
    }
  }, [groupData]);

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
          if (result.name != "" && result.uid != "") {
            result.group_id = groupData?.id;
            await window.electronAPI.addDataFromDB(result);
          }

          setTextReload("1|" + getTimeNowToString());
        }
      } else {
        showToast({ type: "error", message: "Không tìm thấy UID" });
      }
      setIsLoading(false);
      setAlertMessage("");
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
      setAlertMessage("Profile Lấy UID, bị lỗi: " + error);
    }
  };

  const getUIDFromLinkArticle = async () => {
    try {
      const result = await window.electronAPI.facebookGetUIDFromLinkArticle(
        groupData ? groupData.id : 0,
        url,
        cookie,
        interactions
      );
      console.log("getUIDFromLinkArticle", result);
      if (result !== null) {
        if (result.status == true) {
          showToast({ type: "success", message: "Lấy UID hoàn tất" });
          setAlertMessage("Lấy UID hoàn tất");
        } else {
        }
      } else {
        showToast({ type: "error", message: "Không tìm thấy UID" });
      }
      setIsLoading(false);
      setAlertMessage("");
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
      setAlertMessage("Article: Lấy UID, bị lỗi:" + error);
    }
  };

  const handleInteractionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInteractions({
      ...interactions,
      [e.target.name]: e.target.checked,
    });
  };

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

      <ListViewFaebook
        isLoading={isLoading}
        group={groupData}
        textReload={textReload}
      />
      {/* {currentItems.length > 0 && (
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
      )} */}
    </>
  );
};

export default FacebookLayUID;
